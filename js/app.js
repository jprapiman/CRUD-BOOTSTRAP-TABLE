class ApiClient {
    constructor() {
        this.baseUrl = 'api/router.php';
    }

    async request(params = {}, method = 'GET', data = null) {
        const queryString = new URLSearchParams(params).toString();
        const url = `${this.baseUrl}${queryString ? '?' + queryString : ''}`;
        
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Error en la solicitud');
            }

            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async listar(modulo, page = 1, limit = 10) {
        return this.request({
            module: modulo,
            page: page,
            limit: limit
        });
    }

    async crear(modulo, data) {
        return this.request({ module: modulo }, 'POST', data);
    }

    async actualizar(modulo, id, data) {
        return this.request({ 
            module: modulo, 
            id: id 
        }, 'PUT', data);
    }

    async eliminar(modulo, id) {
        return this.request({ 
            module: modulo, 
            id: id 
        }, 'DELETE');
    }
}

class TableManager {
    constructor(apiClient) {
        this.api = apiClient;
        this.tables = {}; // Asegurar que se inicialice
        this.currentActiveTable = null;
        
        console.log('✅ TableManager inicializado, tables:', this.tables);
        
        // Bind de métodos que se usan como callbacks
        this.manejarCambioPestana = this.manejarCambioPestana.bind(this);
        this.generarTableId = this.generarTableId.bind(this);
        this.intentarInicializarTabla = this.intentarInicializarTabla.bind(this);
    }

    inicializarTabla(tableId, modulo, columns) {
		console.log(`🔄 Inicializando tabla ${tableId} para módulo ${modulo}`);
		
		try {
			// Verificar que Bootstrap Table esté disponible
			if (typeof $.fn.bootstrapTable === 'undefined') {
				throw new Error('Bootstrap Table no está disponible');
			}

			// Aplicar formateadores a las columnas
			const columnsConFormatters = this.aplicarFormateadores(columns, modulo);
			
			this.tables[tableId] = {
				modulo: modulo,
				columns: columnsConFormatters,
				dataLoaded: false
			};

			const tableElement = $(`#${tableId}`);
			
			// Destruir tabla existente si existe
			if (tableElement.data('bootstrap.table')) {
				tableElement.bootstrapTable('destroy');
			}

			// DEFINIR tableConfig aquí (esto es lo que faltaba)
			const tableConfig = {
				url: `api/router.php`,
				method: 'GET',
				sidePagination: 'server',
				pagination: true,
				pageSize: 10,
				pageList: [10, 25, 50, 100],
				search: true,
				showColumns: true,
				showRefresh: true,
				columns: columnsConFormatters,
				queryParams: function(params) {
					return {
						module: modulo,
						limit: params.limit,
						offset: params.offset,
						page: params.offset / params.limit + 1,
						search: params.search,
						sort: params.sort,
						order: params.order
					};
				},
				responseHandler: function(res) {
					console.log(`📊 Respuesta recibida para ${tableId}:`, res);
					if (res && res.success) {
						return {
							total: res.total || 0,
							rows: res.data || []
						};
					}
					console.warn(`⚠️ Respuesta sin éxito para ${tableId}:`, res);
					return { total: 0, rows: [] };
				},
				onLoadSuccess: (data) => {
					console.log(`✅ Datos cargados para tabla: ${tableId}`, data);
					this.tables[tableId].dataLoaded = true;
					
					// Inicializar tooltips después de cargar los datos
					setTimeout(() => {
						this.inicializarTooltips();
					}, 100);
				},
				onLoadError: (status, jqXHR) => {
					console.error(`❌ Error cargando tabla ${tableId}:`, status, jqXHR);
					if (window.mostrarNotificacion) {
						window.mostrarNotificacion(`Error cargando datos para ${modulo}`, 'error');
					}
				},
				onPostBody: () => {
					console.log(`✅ Tabla ${tableId} renderizada correctamente`);
				}
			};

			// Inicializar la tabla
			tableElement.bootstrapTable(tableConfig);
			console.log(`✅ Tabla ${tableId} inicializada correctamente`);

		} catch (error) {
			console.error(`❌ Error crítico inicializando tabla ${tableId}:`, error);
			this.mostrarErrorTabla(modulo, tableId, error.message);
			throw error;
		}
	}

	// Agrega este método para inicializar tooltips
	inicializarTooltips() {
		if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
			const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
			const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
				return new bootstrap.Tooltip(tooltipTriggerEl);
			});
			console.log(`✅ ${tooltipList.length} tooltips inicializados`);
		}
	}

    aplicarFormateadores(columns, modulo) {
        return columns.map(column => {
            const col = { ...column };
            
            // Aplicar formateadores según el campo
            if (col.field === 'descripcion') {
                col.formatter = (value) => this.descripcionFormatter(value);
            } else if (col.field === 'created_at') {
                col.formatter = (value) => this.fechaFormatter(value);
            } else if (col.field.includes('precio')) {
                col.formatter = (value) => this.precioFormatter(value);
            } else if (col.field === 'activo' || col.field === 'activa' || col.field === 'es_activo') {
                col.formatter = (value) => this.activoFormatter(value);
            } else if (col.field === 'operate') {
                col.formatter = (value, row) => this.operateFormatter(row, modulo);
            } else if (col.field === 'tiene_iva') {
                col.formatter = (value) => this.ivaFormatter(value);
            } else if (col.field === 'rol') {
                col.formatter = (value) => this.rolFormatter(value);
            } else if (col.field === 'es_principal') {
                col.formatter = (value) => this.principalFormatter(value);
            } else if (col.field === 'modulo') {
                col.formatter = (value) => this.moduloFormatter(value);
            } else if (col.field === 'requiere_cliente' || col.field === 'requiere_referencia') {
                col.formatter = (value) => this.booleanoFormatter(value);
            } else if (col.field === 'formula') {
                col.formatter = (value) => this.formulaFormatter(value);
            } else if (col.field === 'categorias') {
                col.formatter = (value) => this.listaFormatter(value);
            }
            
            return col;
        });
    }

    cargarTabla(tableId) {
        if (!this.tables[tableId]) {
            console.warn(`Tabla ${tableId} no encontrada`);
            return;
        }

        const tableElement = $(`#${tableId}`);
        if (tableElement.length && tableElement.bootstrapTable) {
            console.log(`Cargando datos para tabla: ${tableId}`);
            tableElement.bootstrapTable('refresh');
            this.currentActiveTable = tableId;
        }
    }

    refrescarTablaActual() {
        if (this.currentActiveTable) {
            this.cargarTabla(this.currentActiveTable);
        }
    }

    // En la clase TableManager, modifica el método:
	manejarCambioPestana(tabId) {
		console.log(`🔄 Cambiando a pestaña: ${tabId}`);
		console.log('📊 Estado de tables:', this.tables);
		
		if (!this.tables) {
			console.error('❌ this.tables no está definido en TableManager');
			this.tables = {}; // Inicializar si es undefined
		}
		
		// Mapeo correcto de IDs de pestañas a módulos
		const moduloMap = {
			'productos': 'productos',
			'categorias': 'categorias', 
			'usuarios': 'usuarios',
			'proveedores': 'proveedores',
			'bodegas': 'bodegas',
			'cajas': 'cajas',
			'estados': 'estados',
			'tipos-documento': 'tipos_documento',
			'tipos-promocion': 'tipos_promocion',
			'metodos-pago': 'metodos_pago'
		};
		
		const modulo = moduloMap[tabId] || tabId;
		const tableId = this.generarTableId(modulo);
		
		console.log(`📋 Módulo: ${modulo}, TableID: ${tableId}`);
		console.log('🔍 Tablas disponibles:', Object.keys(this.tables));
		
		if (this.tables[tableId]) {
			console.log(`✅ Cargando tabla existente: ${tableId}`);
			this.cargarTabla(tableId);
		} else {
			console.warn(`⚠️ Tabla no inicializada: ${tableId}`);
			this.intentarInicializarTabla(modulo, tableId);
		}
	}

    // Nueva función para generar IDs de tabla consistentes
    generarTableId(modulo) {
        // Mapeo específico para casos especiales
        const tableIdMap = {
            'tipos_documento': 'tablaTiposDocumento',
            'tipos_promocion': 'tablaTiposPromocion', 
            'metodos_pago': 'tablaMetodosPago'
        };
        
        if (tableIdMap[modulo]) {
            return tableIdMap[modulo];
        }
        
        // Para módulos regulares
        return `tabla${this.capitalize(modulo)}`;
    }

    // Función para intentar inicializar tabla faltante
    intentarInicializarTabla(modulo, tableId) {
        console.log(`Intentando inicializar tabla faltante: ${tableId} para módulo: ${modulo}`);
        
        // Verificar si existe el elemento DOM
        const tableElement = document.getElementById(tableId);
        if (!tableElement) {
            console.error(`Elemento DOM no encontrado: ${tableId}`);
            this.mostrarErrorTabla(modulo, tableId);
            return false;
        }
        
        // Obtener configuración de columnas
        let columnasConfig;
        
        if (window.configManager) {
            columnasConfig = window.configManager.getColumnasConfig(modulo);
        } else if (window.columnasConfig && window.columnasConfig[modulo]) {
            columnasConfig = window.columnasConfig[modulo];
        } else {
            console.error(`No se encontró configuración de columnas para: ${modulo}`);
            return false;
        }
        
        if (!columnasConfig || columnasConfig.length === 0) {
            console.error(`Configuración de columnas vacía para: ${modulo}`);
            return false;
        }
        
        try {
            console.log(`Inicializando tabla: ${tableId} con ${columnasConfig.length} columnas`);
            this.inicializarTabla(tableId, modulo, columnasConfig);
            
            // Cargar datos inmediatamente
            setTimeout(() => {
                this.cargarTabla(tableId);
            }, 100);
            
            return true;
        } catch (error) {
            console.error(`Error inicializando tabla ${tableId}:`, error);
            return false;
        }
    }

    // Función para mostrar error de tabla
    mostrarErrorTabla(modulo, tableId) {
        const container = document.querySelector(`#${tableId.replace('tabla', '').toLowerCase()}`);
        if (container) {
            container.innerHTML = `
                <div class="alert alert-warning" role="alert">
                    <h6><i class="fas fa-exclamation-triangle"></i> Tabla no disponible</h6>
                    <p>No se pudo cargar la tabla para el módulo <strong>${modulo}</strong>.</p>
                    <small>ID esperado: <code>${tableId}</code></small>
                    <br>
                    <button class="btn btn-sm btn-outline-primary mt-2" onclick="location.reload()">
                        <i class="fas fa-sync"></i> Recargar página
                    </button>
                </div>
            `;
        }
    }

    // FORMATEADORES
    descripcionFormatter(value) {
        if (!value) return '<span class="text-muted">N/A</span>';
        const texto = value.length > 50 ? value.substring(0, 50) + '...' : value;
        return `<span title="${value}">${texto}</span>`;
    }

    fechaFormatter(value) {
        if (!value) return '<span class="text-muted">N/A</span>';
        try {
            const fecha = new Date(value);
            return fecha.toLocaleDateString('es-CL');
        } catch (e) {
            return '<span class="text-muted">Fecha inválida</span>';
        }
    }

    precioFormatter(value) {
        if (value === null || value === undefined) return '<span class="text-muted">N/A</span>';
        return `<span class="text-end">$ ${Number(value).toLocaleString('es-CL')}</span>`;
    }

    activoFormatter(value) {
        return value ? 
            '<span class="badge bg-success">Activo</span>' : 
            '<span class="badge bg-danger">Inactivo</span>';
    }

    // En la clase TableManager, mejora el operateFormatter:
	operateFormatter(row, modulo) {
		const nombreModulo = window.configManager ? 
			window.configManager.getNombreModulo(modulo) : 
			modulo;
		
		return `
			<div class="btn-group btn-group-sm" role="group" aria-label="Acciones para ${nombreModulo}">
				<button type="button" 
						class="btn btn-outline-warning" 
						onclick="editar('${modulo}', ${row.id})" 
						title="Editar ${nombreModulo}"
						data-bs-toggle="tooltip"
						data-bs-placement="top">
					<i class="fas fa-edit fa-xs"></i>
				</button>
				<button type="button" 
						class="btn btn-outline-danger" 
						onclick="eliminar('${modulo}', ${row.id})" 
						title="Eliminar ${nombreModulo}"
						data-bs-toggle="tooltip"
						data-bs-placement="top">
					<i class="fas fa-trash fa-xs"></i>
				</button>
			</div>
		`;
	}

    ivaFormatter(value) {
        return value ? 
            '<span class="badge bg-info">Sí</span>' : 
            '<span class="badge bg-secondary">No</span>';
    }

    rolFormatter(value) {
        const colores = {
            'ADMIN': 'danger',
            'CAJERO': 'primary',
            'BODEGUERO': 'success',
            'SUPERVISOR': 'warning'
        };
        
        const color = colores[value] || 'secondary';
        return `<span class="badge bg-${color}">${value}</span>`;
    }

    principalFormatter(value) {
        return value ? 
            '<span class="badge bg-primary"><i class="fas fa-star"></i> Principal</span>' : 
            '<span class="badge bg-secondary">Secundaria</span>';
    }

    moduloFormatter(value) {
        const colores = {
            'VENTA': 'primary',
            'TURNO': 'success',
            'PAGO': 'info',
            'TRASLADO': 'warning'
        };
        
        const color = colores[value] || 'secondary';
        return `<span class="badge bg-${color}">${value}</span>`;
    }

    booleanoFormatter(value) {
        return value ? 
            '<span class="badge bg-success"><i class="fas fa-check"></i></span>' : 
            '<span class="badge bg-secondary"><i class="fas fa-times"></i></span>';
    }

    formulaFormatter(value) {
        if (!value) return '<span class="text-muted">N/A</span>';
        const texto = value.length > 50 ? value.substring(0, 50) + '...' : value;
        return `<code class="text-sm" title="${value}">${texto}</code>`;
    }

    listaFormatter(value) {
        if (!value) return '<span class="text-muted">Sin categorías</span>';
        return value.split(', ').map(item => 
            `<span class="badge bg-light text-dark me-1">${item}</span>`
        ).join('');
    }
	
    capitalize(str) {
        return str.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join('');
    }
}


	// Función mejorada para verificar inicialización
	function verificarInicializacionTablas() {
		console.log('🔍 Verificando inicialización de tablas...');
		
		if (!window.tableManager) {
			console.error('❌ TableManager no disponible');
			return false;
		}
		
		const tablas = Object.keys(window.tableManager.tables);
		console.log('📊 Tablas inicializadas:', tablas);
		
		// Verificar que Bootstrap Table esté disponible
		if (typeof $.fn.bootstrapTable === 'undefined') {
			console.error('❌ Bootstrap Table no está cargado');
			return false;
		}
		
		console.log('✅ Bootstrap Table disponible');
		return true;
	}

	// Función para forzar inicialización de tablas
	
	function forzarInicializacionTablas() {
		
		console.log('🔄 Forzando inicialización de tablas...');
		
		if (!window.tableManager) {
			console.error('TableManager no disponible');
			return;
		}
		
		// Reinicializar todas las tablas
		Object.keys(window.tableManager.tables).forEach(tableId => {
			const tableConfig = window.tableManager.tables[tableId];
			console.log(`🔄 Reinicializando tabla: ${tableId}`, tableConfig);
			
			const tableElement = $(`#${tableId}`);
			if (tableElement.length) {
				if (tableElement.bootstrapTable) {
					tableElement.bootstrapTable('destroy');
				}
				
				// Recrear la tabla con la configuración existente
				window.tableManager.inicializarTabla(
					tableId, 
					tableConfig.modulo, 
					tableConfig.columns
				);
			}
		});
	}

// Función para mostrar notificaciones
// REEMPLAZA la función mostrarNotificacion en app.js con esta versión:
function mostrarNotificacion(mensaje, tipo = 'info') {
    console.log(`📢 Notificación [${tipo}]: ${mensaje}`);
    
    // Usar el sistema de notificaciones si está disponible
    if (window.sistemaNotificaciones) {
        switch (tipo) {
            case 'success':
                window.sistemaNotificaciones.exito(mensaje);
                break;
            case 'error':
                window.sistemaNotificaciones.error(mensaje);
                break;
            case 'warning':
                window.sistemaNotificaciones.advertencia(mensaje);
                break;
            default:
                window.sistemaNotificaciones.info(mensaje);
        }
    } 
    // Si no hay sistema de notificaciones, usar fallback mejorado
    else if (window.mostrarNotificacionPersonalizada) {
        window.mostrarNotificacionPersonalizada(mensaje, tipo);
    }
    // Último fallback: console.log
    else {
        console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
        // Mostrar notificación básica con estilos
        mostrarNotificacionFallback(mensaje, tipo);
    }
}

// Función de fallback para notificaciones básicas
function mostrarNotificacionFallback(mensaje, tipo = 'info') {
    const colores = {
        success: '#28a745',
        error: '#dc3545', 
        warning: '#ffc107',
        info: '#17a2b8'
    };
    
    const iconos = {
        success: '✅',
        error: '❌',
        warning: '⚠️', 
        info: 'ℹ️'
    };
    
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colores[tipo] || '#17a2b8'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        max-width: 400px;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    notificacion.innerHTML = `
        <span style="font-size: 16px;">${iconos[tipo] || 'ℹ️'}</span>
        <span>${mensaje}</span>
    `;
    
    document.body.appendChild(notificacion);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        notificacion.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 300);
    }, 5000);
    
    // Agregar estilos de animación si no existen
    if (!document.querySelector('#notificacion-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notificacion-styles';
        styles.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(styles);
    }
}

// Instancias globales
// Instancias globales - crear inmediatamente
console.log('Creando instancias globales...');
window.api = new ApiClient();
window.tableManager = new TableManager(window.api);

// Referencias locales para compatibilidad
let api = window.api;
let tableManager = window.tableManager;

console.log('API disponible:', !!window.api);
console.log('TableManager disponible:', !!window.tableManager);



 function capitalize(str) {
	return str.split('_').map(word => 
		word.charAt(0).toUpperCase() + word.slice(1)
	).join('');
}
// CORRECCIÓN: La función manejarCambioPestana global debe llamar al método del tableManager
// CORRECCIÓN: Función global que llama al TableManager correctamente
function manejarCambioPestana(pestanaId) {
    console.log('🌍 Función global manejarCambioPestana llamada con:', pestanaId);
    
    if (window.tableManager) {
        console.log('✅ TableManager disponible, llamando método...');
        window.tableManager.manejarCambioPestana(pestanaId);
    } else {
        console.error('❌ TableManager no disponible en función global');
        console.log('🔍 window.tableManager:', window.tableManager);
        console.log('🔍 window.api:', window.api);
        
        // Intentar recrear TableManager si no existe
        if (window.api && !window.tableManager) {
            console.log('🔄 Recreando TableManager...');
            window.tableManager = new TableManager(window.api);
        }
    }
}

function inicializarSistema() {
    console.log('🚀 Inicializando sistema con verificación mejorada...');
    
    // Verificar que las instancias globales estén correctas
    if (!window.api) {
        console.error('❌ API no disponible, recreando...');
        window.api = new ApiClient();
    }
    
    if (!window.tableManager) {
        console.error('❌ TableManager no disponible, recreando...');
        window.tableManager = new TableManager(window.api);
    }
    
    console.log('✅ Instancias verificadas:', {
        api: !!window.api,
        tableManager: !!window.tableManager,
        tables: window.tableManager ? window.tableManager.tables : 'no tableManager'
    });
    
    // Usar la nueva estructura de configuración
    let modulosConfig;
    
    if (window.configManager) {
        console.log('✅ Usando ConfigManager con nueva estructura');
        const modulos = window.configManager.getModulosConfigurados();
        modulosConfig = {};
        
        modulos.forEach(modulo => {
            const columnas = window.configManager.getColumnasConfig(modulo);
            if (columnas && columnas.length > 0) {
                modulosConfig[modulo] = columnas;
            }
        });
    } else if (typeof columnasConfig !== 'undefined') {
        console.log('✅ Usando estructura anterior (columnasConfig)');
        modulosConfig = columnasConfig;
    } else {
        console.error('❌ No se encontró configuración de columnas');
        mostrarNotificacion('Error de configuración: No se encontró configuración de columnas', 'error');
        return;
    }

    console.log('📋 Inicializando tablas para módulos:', Object.keys(modulosConfig));

    // Inicializar todas las tablas con verificación mejorada
    Object.keys(modulosConfig).forEach(modulo => {
        const tableId = window.tableManager.generarTableId(modulo);
        const tableElement = document.getElementById(tableId);
        
        console.log(`🔍 Verificando tabla: ${tableId} para módulo: ${modulo}`);
        
        if (tableElement) {
            console.log(`✅ Inicializando tabla: ${tableId}`);
            try {
                window.tableManager.inicializarTabla(tableId, modulo, modulosConfig[modulo]);
                console.log(`✅ Tabla ${tableId} inicializada correctamente`);
            } catch (error) {
                console.error(`❌ Error inicializando tabla ${tableId}:`, error);
            }
        } else {
            console.warn(`⚠️ Elemento DOM no encontrado: ${tableId}`);
            
            // Debug adicional
            const todasLasTablas = document.querySelectorAll('table[id^="tabla"]');
            console.log('🔍 Tablas disponibles en DOM:', 
                Array.from(todasLasTablas).map(t => t.id)
            );
        }
    });

    // Verificar el resultado
    setTimeout(() => {
        console.log('📊 Resumen final de tablas:', {
            configuradas: Object.keys(modulosConfig).length,
            inicializadas: Object.keys(window.tableManager.tables).length,
            tablas: window.tableManager.tables
        });
        
        if (Object.keys(window.tableManager.tables).length > 0) {
            mostrarNotificacion('Sistema inicializado correctamente', 'success');
        } else {
            mostrarNotificacion('No se pudieron inicializar las tablas', 'warning');
        }
    }, 1000);
}
// ELIMINA el método manejarCambioPestana de la clase TableManager
// Y reemplázalo por esta función global mejorada:

function manejarCambioPestana(tabId) {
    console.log('🌍 Función global manejarCambioPestana llamada con:', tabId);
    
    // Verificar que tableManager exista y tenga tables
    if (!window.tableManager) {
        console.error('❌ TableManager no disponible');
        mostrarNotificacion('Error: Sistema de tablas no disponible', 'error');
        return;
    }
    
    if (!window.tableManager.tables) {
        console.error('❌ tableManager.tables no está definido');
        console.log('🔍 tableManager completo:', window.tableManager);
        
        // Intentar reparar
        window.tableManager.tables = {};
        console.log('🔄 tables inicializado:', window.tableManager.tables);
    }
    
    // Mapeo correcto de IDs de pestañas a módulos
    const moduloMap = {
        'productos': 'productos',
        'categorias': 'categorias', 
        'usuarios': 'usuarios',
        'proveedores': 'proveedores',
        'bodegas': 'bodegas',
        'cajas': 'cajas',
        'estados': 'estados',
        'tipos-documento': 'tipos_documento',
        'tipos-promocion': 'tipos_promocion',
        'metodos-pago': 'metodos_pago'
    };
    
    const modulo = moduloMap[tabId] || tabId;
    const tableId = generarTableId(modulo);
    
    console.log(`📋 Módulo: ${modulo}, TableID: ${tableId}`);
    console.log('🔍 Tablas disponibles:', Object.keys(window.tableManager.tables));
    
    if (window.tableManager.tables[tableId]) {
        console.log(`✅ Cargando tabla existente: ${tableId}`);
        window.tableManager.cargarTabla(tableId);
    } else {
        console.warn(`⚠️ Tabla no inicializada: ${tableId}`);
        intentarInicializarTabla(modulo, tableId);
    }
}
function generarTableId(modulo) {
    console.log(`🔧 Generando tableId para módulo: ${modulo}`);
    
    // Intentar usar la configuración primero
    if (CONFIGURACION_SISTEMA.mapeos && CONFIGURACION_SISTEMA.mapeos.moduloToTableId) {
        const tableIdConfigurado = CONFIGURACION_SISTEMA.mapeos.moduloToTableId[modulo];
        if (tableIdConfigurado) {
            console.log(`✅ TableId desde configuración: ${tableIdConfigurado}`);
            return tableIdConfigurado;
        }
    }
    
    // Fallback: lógica original
    const tableIdMap = {
        'tipos_documento': 'tablaTiposDocumento',
        'tipos_promocion': 'tablaTiposPromocion', 
        'metodos_pago': 'tablaMetodosPago'
    };
    
    const tableId = tableIdMap[modulo] || `tabla${capitalize(modulo)}`;
    console.log(`🔧 TableId calculado: ${tableId}`);
    
    return tableId;
}

// Función auxiliar para intentar inicializar tabla
function intentarInicializarTabla(modulo, tableId) {
    console.log(`🔧 Intentando inicializar tabla faltante: ${tableId} para módulo: ${modulo}`);
    
    // Verificar si existe el elemento DOM
    const tableElement = document.getElementById(tableId);
    if (!tableElement) {
        console.error(`❌ Elemento DOM no encontrado: ${tableId}`);
        mostrarErrorTabla(modulo, tableId);
        return false;
    }
    
    // Obtener configuración de columnas
    let columnasConfig;
    
    if (window.configManager) {
        columnasConfig = window.configManager.getColumnasConfig(modulo);
    } else if (window.columnasConfig && window.columnasConfig[modulo]) {
        columnasConfig = window.columnasConfig[modulo];
    } else {
        console.error(`❌ No se encontró configuración de columnas para: ${modulo}`);
        return false;
    }
    
    if (!columnasConfig || columnasConfig.length === 0) {
        console.error(`❌ Configuración de columnas vacía para: ${modulo}`);
        return false;
    }
    
    try {
        console.log(`✅ Inicializando tabla: ${tableId} con ${columnasConfig.length} columnas`);
        window.tableManager.inicializarTabla(tableId, modulo, columnasConfig);
        
        // Cargar datos inmediatamente
        setTimeout(() => {
            window.tableManager.cargarTabla(tableId);
        }, 100);
        
        return true;
    } catch (error) {
        console.error(`❌ Error inicializando tabla ${tableId}:`, error);
        return false;
    }
}

// Función para mostrar error de tabla
function mostrarErrorTabla(modulo, tableId) {
    const container = document.querySelector(`#${tableId.replace('tabla', '').toLowerCase()}`);
    if (container) {
        container.innerHTML = `
            <div class="alert alert-warning" role="alert">
                <h6><i class="fas fa-exclamation-triangle"></i> Tabla no disponible</h6>
                <p>No se pudo cargar la tabla para el módulo <strong>${modulo}</strong>.</p>
                <small>ID esperado: <code>${tableId}</code></small>
                <br>
                <button class="btn btn-sm btn-outline-primary mt-2" onclick="location.reload()">
                    <i class="fas fa-sync"></i> Recargar página
                </button>
            </div>
        `;
    }
}

// Función mejorada para inicializar sistema

function inicializarSistema() {
    console.log('🚀 Inicializando sistema con verificación mejorada...');
    
    // Verificar que las instancias globales estén correctas
    if (!window.api) {
        console.error('❌ API no disponible, recreando...');
        window.api = new ApiClient();
    }
    
    if (!window.tableManager) {
        console.error('❌ TableManager no disponible, recreando...');
        window.tableManager = new TableManager(window.api);
    }
    
    console.log('✅ Instancias verificadas:', {
        api: !!window.api,
        tableManager: !!window.tableManager,
        tables: window.tableManager ? window.tableManager.tables : 'no tableManager'
    });
    
    // Usar la nueva estructura de configuración
    let modulosConfig;
    
    if (window.configManager) {
        console.log('✅ Usando ConfigManager con nueva estructura');
        const modulos = window.configManager.getModulosConfigurados();
        modulosConfig = {};
        
        modulos.forEach(modulo => {
            const columnas = window.configManager.getColumnasConfig(modulo);
            if (columnas && columnas.length > 0) {
                modulosConfig[modulo] = columnas;
            }
        });
    } else if (typeof columnasConfig !== 'undefined') {
        console.log('✅ Usando estructura anterior (columnasConfig)');
        modulosConfig = columnasConfig;
    } else {
        console.error('❌ No se encontró configuración de columnas');
        mostrarNotificacion('Error de configuración: No se encontró configuración de columnas', 'error');
        return;
    }

    console.log('📋 Inicializando tablas para módulos:', Object.keys(modulosConfig));

    // Inicializar todas las tablas con verificación mejorada
    Object.keys(modulosConfig).forEach(modulo => {
        const tableId = window.tableManager.generarTableId(modulo);
        const tableElement = document.getElementById(tableId);
        
        console.log(`🔍 Verificando tabla: ${tableId} para módulo: ${modulo}`);
        
        if (tableElement) {
            console.log(`✅ Inicializando tabla: ${tableId}`);
            try {
                window.tableManager.inicializarTabla(tableId, modulo, modulosConfig[modulo]);
                console.log(`✅ Tabla ${tableId} inicializada correctamente`);
            } catch (error) {
                console.error(`❌ Error inicializando tabla ${tableId}:`, error);
            }
        } else {
            console.warn(`⚠️ Elemento DOM no encontrado: ${tableId}`);
        }
    });

    // FORZAR CARGA DE LA PRIMERA TABLA DESPUÉS DE INICIALIZAR
    setTimeout(() => {
        console.log('🎯 Cargando primera tabla automáticamente...');
        cargarPrimeraTabla();
    }, 500);
}


// NUEVA FUNCIÓN: Activar pestaña por módulo
function activarPestanaPorModulo(modulo) {
    console.log(`🔍 Activando pestaña para módulo: ${modulo}`);
    
    // Obtener el ID de pestaña desde la configuración
    let pestanaId;
    
    if (window.configManager) {
        // Usar el método del configManager si está disponible
        pestanaId = window.configManager.convertirModuloATabId(modulo);
    } else if (window.generadorHTML) {
        // Usar el generadorHTML si está disponible
        pestanaId = window.generadorHTML.convertirModuloATabId(modulo);
    } else {
        // Fallback: usar el mapeo desde la configuración global
        const moduloConfig = CONFIGURACION_SISTEMA.modulos[modulo];
        if (moduloConfig) {
            // Usar la misma lógica que en generador-html.js
            const mapaEspecial = {
                'tipos_documento': 'tipos-documento',
                'tipos_promocion': 'tipos-promocion', 
                'metodos_pago': 'metodos-pago'
            };
            pestanaId = mapaEspecial[modulo] || modulo;
        } else {
            console.error(`❌ No se encontró configuración para módulo: ${modulo}`);
            return;
        }
    }
    
    console.log(`🎯 ID de pestaña calculado: ${pestanaId}`);
    
    if (!pestanaId) {
        console.warn(`⚠️ No se pudo determinar pestaña para módulo: ${modulo}`);
        return;
    }
    
    // Encontrar el botón de la pestaña y activarlo
    const pestanaElement = document.getElementById(`${pestanaId}-tab`);
    const contenidoElement = document.getElementById(pestanaId);
    
    if (pestanaElement && contenidoElement) {
        // Remover active de todas las pestañas
        document.querySelectorAll('.nav-link').forEach(navLink => {
            navLink.classList.remove('active');
        });
        
        // Remover show active de todos los contenidos
        document.querySelectorAll('.tab-pane').forEach(tabPane => {
            tabPane.classList.remove('show', 'active');
        });
        
        // Activar la pestaña seleccionada
        pestanaElement.classList.add('active');
        contenidoElement.classList.add('show', 'active');
        
        console.log(`✅ Pestaña ${pestanaId} activada correctamente`);
    } else {
        console.error(`❌ No se pudo encontrar elementos de pestaña: ${pestanaId}-tab o ${pestanaId}`);
        
        // Debug: mostrar todas las pestañas disponibles
        const pestanasDisponibles = Array.from(document.querySelectorAll('.nav-link')).map(p => p.id);
        const contenidosDisponibles = Array.from(document.querySelectorAll('.tab-pane')).map(t => t.id);
        console.log('🔍 Pestañas disponibles:', pestanasDisponibles);
        console.log('🔍 Contenidos disponibles:', contenidosDisponibles);
    }
}



// INICIALIZACIÓN DE SEGURIDAD - Por si falla la inicialización automática
function inicializacionSeguridad() {
    console.log('🔧 Ejecutando inicialización de seguridad...');
    
    // Verificar si el sistema ya se inicializó
    const tablasInicializadas = window.tableManager && window.tableManager.tables ? 
        Object.keys(window.tableManager.tables) : [];
    
    if (tablasInicializadas.length === 0) {
        console.log('🔄 Sistema no inicializado, forzando inicialización...');
        
        if (typeof inicializarSistema === 'function') {
            inicializarSistema();
        } else {
            console.error('❌ inicializarSistema no disponible');
        }
    } else {
        console.log('✅ Sistema ya inicializado, tablas:', tablasInicializadas);
    }
}

// Ejecutar después de 3 segundos por si falla la inicialización automática
setTimeout(inicializacionSeguridad, 3000);

// También ejecutar cuando la página esté completamente cargada
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializacionSeguridad);
} else {
    inicializacionSeguridad();
}

// Funciones para la nueva estructura
function recargarTabla(tableId) {
    if (window.tableManager) {
        window.tableManager.cargarTabla(tableId);
        mostrarNotificacion('Tabla actualizada', 'success');
    }
}

function exportarTodo() {
    mostrarNotificacion('Función de exportación en desarrollo', 'info');
}

// Búsqueda global (concepto)
function configurarBusquedaGlobal() {
    const busquedaGlobal = document.getElementById('busquedaGlobal');
    if (busquedaGlobal) {
        busquedaGlobal.addEventListener('input', function(e) {
            const termino = e.target.value.toLowerCase();
            // Implementar búsqueda global en todas las tablas
            console.log('Búsqueda global:', termino);
        });
    }
}

// Actualizar contadores de registros
function actualizarContadores() {
    if (window.tableManager) {
        Object.keys(window.tableManager.tables).forEach(tableId => {
            const contador = document.getElementById(`contador-${tableId}`);
            if (contador) {
                // Esto se podría mejorar obteniendo el total real de la API
                contador.textContent = 'Cargando...';
            }
        });
    }
}

// Inicializar funcionalidades de la nueva estructura
function inicializarEstructuraMejorada() {
    configurarBusquedaGlobal();
    actualizarContadores();
    
    console.log('✅ Estructura mejorada inicializada');
}

// Ejecutar después de la carga
setTimeout(inicializarEstructuraMejorada, 2000);

// NUEVA FUNCIÓN: Cargar la primera tabla automáticamente
function cargarPrimeraTabla() {
    if (!window.tableManager || !window.tableManager.tables) {
        console.error('❌ TableManager no disponible para cargar primera tabla');
        return;
    }
    
    // Cargar el primer módulo automáticamente
    const primerModulo = Object.keys(CONFIGURACION_SISTEMA.modulos)[0];
    if (primerModulo) {
        const tabId = window.configManager ? 
            window.configManager.convertirModuloATabId(primerModulo) : 
            primerModulo;
            
        console.log(`🎯 Cargando primer módulo automáticamente: ${primerModulo}`);
        cargarModulo(primerModulo, tabId);
    }
}
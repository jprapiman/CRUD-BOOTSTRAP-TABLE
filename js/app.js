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
        this.tables = {};
        this.currentActiveTable = null;
        
        console.log('✅ TableManager inicializado, tables:', this.tables);
        
        this.manejarCambioPestana = this.manejarCambioPestana.bind(this);
        this.generarTableId = this.generarTableId.bind(this);
        this.intentarInicializarTabla = this.intentarInicializarTabla.bind(this);
    }

    inicializarTabla(tableId, modulo, columns) {
        console.log(`🔄 Inicializando tabla ${tableId} para módulo ${modulo}`);
        
        try {
            if (typeof $.fn.bootstrapTable === 'undefined') {
                throw new Error('Bootstrap Table no está disponible');
            }

            const columnsConFormatters = this.aplicarFormateadores(columns, modulo);
            
            this.tables[tableId] = {
                modulo: modulo,
                columns: columnsConFormatters,
                dataLoaded: false
            };

            const tableElement = $(`#${tableId}`);
            
            if (tableElement.data('bootstrap.table')) {
                tableElement.bootstrapTable('destroy');
            }

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

            tableElement.bootstrapTable(tableConfig);
            console.log(`✅ Tabla ${tableId} inicializada correctamente`);

        } catch (error) {
            console.error(`❌ Error crítico inicializando tabla ${tableId}:`, error);
            this.mostrarErrorTabla(modulo, tableId, error.message);
            throw error;
        }
    }

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

    // En el método manejarCambioPestana, reemplazar:
	// En manejarCambioPestana, simplificar:
	manejarCambioPestana(tabId) {
		console.log(`🔄 Cambiando a pestaña: ${tabId}`);
		
		if (!this.tables) {
			console.error('❌ this.tables no está definido en TableManager');
			this.tables = {};
		}
		
		// USAR CONFIGMANAGER PARA OBTENER MÓDULO
		let modulo;
		if (window.configManager) {
			modulo = window.configManager.getModuloPorTabId(tabId);
		} else {
			modulo = tabId; // Fallback mínimo
		}
		
		const tableId = this.generarTableId(modulo);
		
		console.log(`📋 Módulo: ${modulo}, TableID: ${tableId}`);
		
		if (this.tables[tableId]) {
			console.log(`✅ Cargando tabla existente: ${tableId}`);
			this.cargarTabla(tableId);
		} else {
			console.warn(`⚠️ Tabla no inicializada: ${tableId}`);
			this.intentarInicializarTabla(modulo, tableId);
		}
	}

	// En generarTableId, simplificar:
	generarTableId(modulo) {
		// USAR CONFIGMANAGER
		if (window.configManager) {
			return window.configManager.getTableIdPorModulo(modulo);
		}
		
		// Fallback genérico
		return `tabla${this.capitalize(modulo)}`;
	}

    intentarInicializarTabla(modulo, tableId) {
        console.log(`Intentando inicializar tabla faltante: ${tableId} para módulo: ${modulo}`);
        
        const tableElement = document.getElementById(tableId);
        if (!tableElement) {
            console.error(`Elemento DOM no encontrado: ${tableId}`);
            this.mostrarErrorTabla(modulo, tableId);
            return false;
        }
        
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
            
            setTimeout(() => {
                this.cargarTabla(tableId);
            }, 100);
            
            return true;
        } catch (error) {
            console.error(`Error inicializando tabla ${tableId}:`, error);
            return false;
        }
    }

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

function verificarInicializacionTablas() {
    console.log('🔍 Verificando inicialización de tablas...');
    
    if (!window.tableManager) {
        console.error('❌ TableManager no disponible');
        return false;
    }
    
    const tablas = Object.keys(window.tableManager.tables);
    console.log('📊 Tablas inicializadas:', tablas);
    
    if (typeof $.fn.bootstrapTable === 'undefined') {
        console.error('❌ Bootstrap Table no está cargado');
        return false;
    }
    
    console.log('✅ Bootstrap Table disponible');
    return true;
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    console.log(`📢 Notificación [${tipo}]: ${mensaje}`);
    
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
    } else if (window.mostrarNotificacionPersonalizada) {
        window.mostrarNotificacionPersonalizada(mensaje, tipo);
    } else {
        console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
        mostrarNotificacionFallback(mensaje, tipo);
    }
}

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
    
    setTimeout(() => {
        notificacion.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 300);
    }, 5000);
    
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

console.log('Creando instancias globales...');
window.api = new ApiClient();
window.tableManager = new TableManager(window.api);

let api = window.api;
let tableManager = window.tableManager;

console.log('API disponible:', !!window.api);
console.log('TableManager disponible:', !!window.tableManager);

function capitalize(str) {
    return str.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join('');
}

function manejarCambioPestana(pestanaId) {
    console.log('🌍 Función global manejarCambioPestana llamada con:', pestanaId);
    
    if (window.tableManager) {
        console.log('✅ TableManager disponible, llamando método...');
        window.tableManager.manejarCambioPestana(pestanaId);
    } else {
        console.error('❌ TableManager no disponible en función global');
        
        if (window.api && !window.tableManager) {
            console.log('🔄 Recreando TableManager...');
            window.tableManager = new TableManager(window.api);
        }
    }
}

// ==== AGREGAR ESTA FUNCIÓN EN app.js ====
// Colócala después de las clases y antes de inicializarSistema

// Función para cargar el primer módulo automáticamente
function cargarPrimerModulo() {
    console.log('🎯 Cargando primer módulo automáticamente...');
    
    if (!window.configManager || !window.tableManager) {
        console.error('❌ ConfigManager o TableManager no disponibles');
        setTimeout(cargarPrimerModulo, 500); // Reintentar después de 500ms
        return;
    }
    
    const modulos = window.configManager.getModulosConfigurados();
    if (modulos.length === 0) {
        console.error('❌ No hay módulos configurados');
        return;
    }
    
    const primerModulo = modulos[0];
    console.log(`📂 Cargando primer módulo: ${primerModulo}`);
    
    // Verificar si estamos usando la estructura con sidebar
    const contenidoModulo = document.getElementById('contenido-modulo');
    const sidebarItems = document.querySelectorAll('.list-group-item[data-modulo]');
    
    if (contenidoModulo && sidebarItems.length > 0) {
        console.log('✅ Estructura con sidebar detectada');
        // Estructura con sidebar - usar cargarModuloMenu
        if (typeof cargarModuloMenu === 'function') {
            // Activar el primer item del menú
            const primerItem = document.querySelector('.list-group-item[data-modulo]');
            if (primerItem) {
                primerItem.classList.add('active');
            }
            cargarModuloMenu(primerModulo);
        } else {
            console.error('❌ cargarModuloMenu no está disponible');
            // Fallback: simular click en el primer item
            const primerItem = document.querySelector('.list-group-item[data-modulo]');
            if (primerItem) {
                primerItem.click();
            }
        }
    } else {
        console.log('ℹ️ Estructura con pestañas detectada');
        // Estructura con pestañas - activar primera pestaña
        const tabId = window.configManager ? 
            window.configManager.convertirModuloATabId(primerModulo) : 
            primerModulo;
            
        console.log(`🎯 Activando pestaña: ${tabId}`);
        
        const tabElement = document.getElementById(`${tabId}-tab`);
        if (tabElement) {
            tabElement.click();
        } else {
            console.error(`❌ No se encontró la pestaña: ${tabId}-tab`);
            // Buscar cualquier pestaña disponible
            const primeraTab = document.querySelector('.nav-link');
            if (primeraTab) {
                primeraTab.click();
            }
        }
    }
}

// Hacer la función disponible globalmente
window.cargarPrimerModulo = cargarPrimerModulo;


function inicializarSistema() {
    console.log('🚀 Inicializando sistema con verificación mejorada...');
    
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

function inicializarSistema() {
    console.log('🚀 Inicializando sistema con verificación mejorada...');
    
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

    console.log('📋 Módulos configurados para inicialización:', Object.keys(modulosConfig));

    // SOLO inicializar tablas si los elementos DOM existen
    let tablasInicializadas = 0;
    
    Object.keys(modulosConfig).forEach(modulo => {
        const tableId = window.tableManager.generarTableId(modulo);
        const tableElement = document.getElementById(tableId);
        
        console.log(`🔍 Verificando tabla: ${tableId} para módulo: ${modulo}`);
        
        if (tableElement) {
            console.log(`✅ Inicializando tabla: ${tableId}`);
            try {
                window.tableManager.inicializarTabla(tableId, modulo, modulosConfig[modulo]);
                console.log(`✅ Tabla ${tableId} inicializada correctamente`);
                tablasInicializadas++;
            } catch (error) {
                console.error(`❌ Error inicializando tabla ${tableId}:`, error);
            }
        } else {
            console.log(`⏳ Tabla ${tableId} no encontrada en DOM (se inicializará cuando se necesite)`);
        }
    });

    setTimeout(() => {
        console.log('📊 Resumen final de tablas:', {
            configuradas: Object.keys(modulosConfig).length,
            inicializadas: tablasInicializadas,
            tablas: Object.keys(window.tableManager.tables)
        });
        
        if (tablasInicializadas > 0) {
            mostrarNotificacion(`Sistema inicializado - ${tablasInicializadas} tablas listas`, 'success');
        } else {
            console.log('ℹ️ No se inicializaron tablas aún - se inicializarán bajo demanda');
        }
    }, 1000);
}

function recargarTabla(tableId) {
    if (window.tableManager) {
        window.tableManager.cargarTabla(tableId);
        mostrarNotificacion('Tabla actualizada', 'success');
    }
}

function exportarTodo() {
    mostrarNotificacion('Función de exportación en desarrollo', 'info');
}

function configurarBusquedaGlobal() {
    const busquedaGlobal = document.getElementById('busquedaGlobal');
    if (busquedaGlobal) {
        busquedaGlobal.addEventListener('input', function(e) {
            const termino = e.target.value.toLowerCase();
            console.log('Búsqueda global:', termino);
        });
    }
}

function actualizarContadores() {
    if (window.tableManager) {
        Object.keys(window.tableManager.tables).forEach(tableId => {
            const contador = document.getElementById(`contador-${tableId}`);
            if (contador) {
                contador.textContent = 'Cargando...';
            }
        });
    }
}

function inicializarEstructuraMejorada() {
    configurarBusquedaGlobal();
    actualizarContadores();
    
    console.log('✅ Estructura mejorada inicializada');
}

setTimeout(inicializarEstructuraMejorada, 2000);

function cargarPrimeraTabla() {
    if (!window.tableManager || !window.tableManager.tables) {
        console.error('❌ TableManager no disponible para cargar primera tabla');
        return;
    }
    
    const primerModulo = Object.keys(CONFIGURACION_SISTEMA.modulos)[0];
    if (primerModulo) {
        const tabId = window.configManager ? 
            window.configManager.convertirModuloATabId(primerModulo) : 
            primerModulo;
            
        console.log(`🎯 Cargando primer módulo automáticamente: ${primerModulo}`);
        cargarModulo(primerModulo, tabId);
    }
}

function cargarModuloMenu(modulo) {
    console.log(`📂 Cargando módulo: ${modulo}`);
    
    // Verificar que los elementos necesarios existan
    if (!window.configManager || !window.tableManager) {
        console.error('❌ ConfigManager o TableManager no disponibles');
        setTimeout(() => cargarModuloMenu(modulo), 500);
        return;
    }
    
    const moduloConfig = CONFIGURACION_SISTEMA.modulos[modulo];
    if (!moduloConfig) {
        console.error(`❌ Configuración no encontrada para módulo: ${modulo}`);
        return;
    }
    
    // Actualizar menú activo
    document.querySelectorAll('.list-group-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const itemActivo = document.querySelector(`[data-modulo="${modulo}"]`);
    if (itemActivo) {
        itemActivo.classList.add('active');
    }
    
   const contenido = document.getElementById('contenido-modulo');
    if (!contenido) {
        console.error('❌ No se encontró el contenedor de contenido');
        return;
    }
    
    const tableId = window.tableManager.generarTableId(modulo);
    
    // Generar el contenido del módulo usando GeneradorHTML
    contenido.innerHTML = window.generadorHTML.generarContenidoModuloHTML(modulo, moduloConfig, tableId);
    
    // Inicializar tabla después de crear el HTML
    setTimeout(() => {
        try {
            const columnasConfig = window.configManager.getColumnasConfig(modulo);
            
            if (!columnasConfig || columnasConfig.length === 0) {
                console.error(`❌ No hay configuración de columnas para: ${modulo}`);
                return;
            }
            
            // Verificar que la tabla existe en el DOM
            const tableElement = document.getElementById(tableId);
            if (!tableElement) {
                console.error(`❌ No se pudo crear la tabla: ${tableId}`);
                return;
            }
            
            // Inicializar la tabla si no existe
            if (!window.tableManager.tables[tableId]) {
                console.log(`🔄 Inicializando tabla bajo demanda: ${tableId}`);
                window.tableManager.inicializarTabla(tableId, modulo, columnasConfig);
            }
            
            // Cargar datos
            window.tableManager.cargarTabla(tableId);
            console.log(`✅ Módulo ${modulo} cargado correctamente`);
            
        } catch (error) {
            console.error(`❌ Error cargando módulo ${modulo}:`, error);
        }
    }, 100);
}

// Hacer la función disponible globalmente
window.cargarModuloMenu = cargarModuloMenu;

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            const sidebar = document.getElementById('sidebar-wrapper');
            sidebar.classList.toggle('toggled');
        });
    }
});

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar-wrapper');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}
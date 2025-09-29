// config-manager.js - Gestor actualizado para la nueva estructura
class ConfigManager {
    constructor() {
        this.config = {};
        this.inicializar();
    }

    inicializar() {
        if (typeof CONFIGURACION_SISTEMA !== 'undefined') {
            this.config = CONFIGURACION_SISTEMA;
            console.log('✅ Configuración unificada cargada con nueva estructura');
            this.validarEstructura();
        } else {
            console.error('❌ CONFIGURACION_SISTEMA no encontrada');
            this.config = {
                sistema: {},
                modulos: {},
                api: {},
                ui: {}
            };
        }
    }

    // ===== MÉTODOS PRINCIPALES =====
    
    // Obtener configuración de campos de formulario
    getCamposConfig(modulo) {
        const moduloConfig = this.config.modulos[modulo];
        return moduloConfig ? moduloConfig.columnasFormulario || [] : [];
    }

    // Obtener configuración de columnas de tabla
    getColumnasConfig(modulo) {
        const moduloConfig = this.config.modulos[modulo];
        return moduloConfig ? moduloConfig.columnasTablas || [] : [];
    }

    // Obtener configuración completa de un módulo
    getModuloConfig(modulo) {
        return this.config.modulos[modulo] || null;
    }

    // Obtener nombre singular del módulo
    getNombreModulo(modulo) {
        const moduloConfig = this.config.modulos[modulo];
        return moduloConfig ? moduloConfig.singular : modulo;
    }

    // Obtener nombre plural del módulo
    getNombrePlural(modulo) {
        const moduloConfig = this.config.modulos[modulo];
        return moduloConfig ? moduloConfig.plural : modulo + 's';
    }

    // Obtener icono del módulo
    getIcono(modulo) {
        const moduloConfig = this.config.modulos[modulo];
        return moduloConfig ? moduloConfig.icono : 'fas fa-cube';
    }

    // Obtener género del módulo
    getGenero(modulo) {
        const moduloConfig = this.config.modulos[modulo];
        return moduloConfig ? moduloConfig.genero : 'masculino';
    }

    // Obtener descripción del módulo
    getDescripcion(modulo) {
        const moduloConfig = this.config.modulos[modulo];
        return moduloConfig ? moduloConfig.descripcion : 'Sin descripción';
    }

    // Generar título de formulario
    getTituloFormulario(modulo, esEdicion = false, id = null) {
        const nombre = this.getNombreModulo(modulo);
        if (esEdicion) {
            return `Editar ${nombre}${id ? ` #${id}` : ''}`;
        } else {
            return `Nuevo ${nombre}`;
        }
    }

    // ===== MÉTODOS DE VALIDACIÓN =====
    
    // Verificar si un módulo es válido
    esModuloValido(modulo) {
        return this.tieneCamposConfig(modulo) && this.tieneColumnasConfig(modulo);
    }

    // Verificar si tiene configuración de campos
    tieneCamposConfig(modulo) {
        const moduloConfig = this.config.modulos[modulo];
        return !!(moduloConfig && moduloConfig.columnasFormulario && moduloConfig.columnasFormulario.length > 0);
    }

    // Verificar si tiene configuración de columnas
    tieneColumnasConfig(modulo) {
        const moduloConfig = this.config.modulos[modulo];
        return !!(moduloConfig && moduloConfig.columnasTablas && moduloConfig.columnasTablas.length > 0);
    }

    // Obtener lista de módulos válidos
    getModulosValidos() {
        return Object.keys(this.config.modulos).filter(modulo => 
            this.esModuloValido(modulo)
        );
    }

    // Obtener todos los módulos configurados
    getModulosConfigurados() {
        return Object.keys(this.config.modulos);
    }

    // ===== MÉTODOS DE UTILIDAD =====
    
    // Obtener estadísticas de la configuración
    getEstadisticas() {
        const modulos = this.getModulosConfigurados();
        const modulosConCampos = modulos.filter(mod => this.tieneCamposConfig(mod));
        const modulosConColumnas = modulos.filter(mod => this.tieneColumnasConfig(mod));
        const modulosValidos = this.getModulosValidos();

        return {
            totalModulos: modulos.length,
            modulosConCampos: modulosConCampos.length,
            modulosConColumnas: modulosConColumnas.length,
            modulosValidos: modulosValidos.length,
            modulos: modulos,
            validos: modulosValidos
        };
    }

    // Validar estructura de la configuración
    validarEstructura() {
        const errores = [];
        
        // Validar estructura principal
        if (!this.config.sistema) errores.push('Falta configuración del sistema');
        if (!this.config.modulos) errores.push('Falta configuración de módulos');
        if (!this.config.api) errores.push('Falta configuración de API');
        if (!this.config.ui) errores.push('Falta configuración de UI');

        // Validar cada módulo
        Object.keys(this.config.modulos).forEach(modulo => {
            const moduloConfig = this.config.modulos[modulo];
            
            if (!moduloConfig.singular) errores.push(`${modulo}: falta 'singular'`);
            if (!moduloConfig.plural) errores.push(`${modulo}: falta 'plural'`);
            if (!moduloConfig.columnasFormulario) errores.push(`${modulo}: falta 'columnasFormulario'`);
            if (!moduloConfig.columnasTablas) errores.push(`${modulo}: falta 'columnasTablas'`);
        });

        if (errores.length > 0) {
            console.warn('⚠️ Errores de estructura encontrados:', errores);
            return false;
        } else {
            console.log('✅ Estructura de configuración válida');
            return true;
        }
    }

    // Obtener campo específico de formulario
    getCampoFormulario(modulo, nombreCampo) {
        const campos = this.getCamposConfig(modulo);
        return campos.find(campo => campo.name === nombreCampo) || null;
    }

    // Obtener columna específica de tabla
    getColumnaTabla(modulo, nombreColumna) {
        const columnas = this.getColumnasConfig(modulo);
        return columnas.find(columna => columna.field === nombreColumna) || null;
    }

    // Debug completo
    debug() {
        console.group('🔧 ConfigManager - Nueva Estructura');
        console.log('📊 Estadísticas:', this.getEstadisticas());
        console.log('🏢 Sistema:', this.config.sistema);
        console.log('🌐 API:', this.config.api);
        console.log('🎨 UI:', this.config.ui);
        
        console.group('📦 Módulos Configurados:');
        this.getModulosConfigurados().forEach(modulo => {
            const config = this.getModuloConfig(modulo);
            console.log(`${modulo}:`, {
                singular: config.singular,
                plural: config.plural,
                icono: config.icono,
                campos: config.columnasFormulario?.length || 0,
                columnas: config.columnasTablas?.length || 0,
                esValido: this.esModuloValido(modulo)
            });
        });
        console.groupEnd();
    }

    // ===== MÉTODOS DE COMPATIBILIDAD =====

	// Obtener todos los tabIds configurados
	getTabIdsConfigurados() {
		if (this.config.mapeos && this.config.mapeos.moduloToTabId) {
			return Object.values(this.config.mapeos.moduloToTabId);
		}
		return this.getModulosConfigurados();
	}

	// Verificar si un tabId existe
	existeTabId(tabId) {
		if (this.config.mapeos && this.config.mapeos.moduloToTabId) {
			return Object.values(this.config.mapeos.moduloToTabId).includes(tabId);
		}
		return this.getModulosConfigurados().includes(tabId);
	}
    
    // Generar variables de compatibilidad con la estructura anterior
    generarCompatibilidad() {
        const nombresModulos = {};
        const camposConfig = {};
        const columnasConfig = {};

        Object.keys(this.config.modulos).forEach(modulo => {
            const config = this.config.modulos[modulo];
            
            nombresModulos[modulo] = {
                singular: config.singular,
                plural: config.plural,
                icono: config.icono,
                genero: config.genero,
                descripcion: config.descripcion
            };
            
            camposConfig[modulo] = config.columnasFormulario || [];
            columnasConfig[modulo] = config.columnasTablas || [];
        });

        // Asignar a variables globales
        if (typeof window !== 'undefined') {
            window.nombresModulosConfig = nombresModulos;
            window.camposConfig = camposConfig;
            window.columnasConfig = columnasConfig;
            console.log('🔄 Variables de compatibilidad generadas');
        }

        return { nombresModulos, camposConfig, columnasConfig };
    }
	
	// Convertir módulo a tabId
	convertirModuloATabId(modulo) {
		const moduloConfig = this.getModuloConfig(modulo);
		if (!moduloConfig) {
			console.warn(`⚠️ No se encontró configuración para módulo: ${modulo}`);
			return modulo;
		}
		
		// Mapeo especial para módulos con guiones
		const mapaEspecial = {
			'tipos_documento': 'tipos-documento',
			'tipos_promocion': 'tipos-promocion', 
			'metodos_pago': 'metodos-pago'
		};
		
		return mapaEspecial[modulo] || modulo;
	}
	
	// En la clase ConfigManager, agregar:
	// Obtener tabId desde la configuración del módulo
	getTabIdPorModulo(modulo) {
		const moduloConfig = this.getModuloConfig(modulo);
		if (moduloConfig && moduloConfig.tabId) {
			return moduloConfig.tabId;
		}
		
		// Fallback: generar desde nombre del módulo
		return modulo.replace(/_/g, '-');
	}

	// Obtener tableId desde la configuración del módulo  
	getTableIdPorModulo(modulo) {
		const moduloConfig = this.getModuloConfig(modulo);
		if (moduloConfig && moduloConfig.tableId) {
			return moduloConfig.tableId;
		}
		
		// Fallback: generar desde nombre del módulo
		return `tabla${this.capitalize(modulo)}`;
	}

	// Obtener módulo por tabId (buscando en todos los módulos)
	getModuloPorTabId(tabId) {
		const modulos = this.getModulosConfigurados();
		
		for (let modulo of modulos) {
			const moduloConfig = this.getModuloConfig(modulo);
			if (moduloConfig && moduloConfig.tabId === tabId) {
				return modulo;
			}
		}
		
		// Si no se encuentra, asumir que tabId = nombre módulo
		return tabId;
	}

	// Obtener orden de módulos
	getOrdenModulos() {
		return this.config.ordenModulos || this.getModulosConfigurados();
	}

	// Verificar si un módulo tiene configuración completa
	tieneConfiguracionCompleta(modulo) {
		const config = this.getModuloConfig(modulo);
		return config && 
			   config.tabId && 
			   config.tableId &&
			   config.columnasFormulario && 
			   config.columnasFormulario.length > 0 &&
			   config.columnasTablas && 
			   config.columnasTablas.length > 0;
	}

	// Obtener módulos con configuración completa
	getModulosCompletos() {
		return this.getModulosConfigurados().filter(modulo => 
			this.tieneConfiguracionCompleta(modulo)
		);
	}

	// Capitalizar texto (método de utilidad)
	capitalize(texto) {
		return texto.split('_').map(word => 
			word.charAt(0).toUpperCase() + word.slice(1)
		).join('');
	}
}

// INICIALIZACIÓN INMEDIATA (no esperar DOMContentLoaded)
console.log('🔧 ConfigManager cargado, inicializando inmediatamente...');

// Función para intentar inicializar
function intentarInicializarConfigManager() {
    try {
        if (typeof CONFIGURACION_SISTEMA !== 'undefined') {
            const manager = new ConfigManager();
            window.configManager = manager;
            
            // Generar compatibilidad con estructura anterior
            manager.generarCompatibilidad();
            
            console.log('✅ ConfigManager inicializado con nueva estructura');
            
            // Debug opcional
            if (window.location.hash === '#debug') {
                manager.debug();
            }
            
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('❌ Error inicializando ConfigManager:', error);
        return false;
    }
}

// Intentar inicializar inmediatamente
if (!intentarInicializarConfigManager()) {
    // Si falla, reintentar cada 50ms hasta 5 segundos máximo
    let intentos = 0;
    const maxIntentos = 100;
    const intervalo = setInterval(() => {
        intentos++;
        if (intentarInicializarConfigManager() || intentos >= maxIntentos) {
            clearInterval(intervalo);
            if (intentos >= maxIntentos) {
                console.error('❌ ConfigManager no pudo inicializarse después de múltiples intentos');
            }
        }
    }, 50);
}
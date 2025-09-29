// config-util.js - Funciones de utilidad para la nueva estructura

const ConfigUtil = {
    // Obtener configuración completa de un módulo
    getModuloConfig: function(modulo) {
        return CONFIGURACION_SISTEMA.modulos[modulo] || null;
    },

    // Obtener nombre singular
    getNombreSingular: function(modulo) {
        const config = this.getModuloConfig(modulo);
        return config ? config.singular : this.capitalize(modulo);
    },

    // Obtener nombre plural
    getNombrePlural: function(modulo) {
        const config = this.getModuloConfig(modulo);
        return config ? config.plural : this.capitalize(modulo) + 's';
    },

    // Obtener icono
    getIcono: function(modulo) {
        const config = this.getModuloConfig(modulo);
        return config ? config.icono : 'fas fa-cube';
    },

    // Obtener género
    getGenero: function(modulo) {
        const config = this.getModuloConfig(modulo);
        return config ? config.genero : 'masculino';
    },

    // Obtener campos de formulario (nueva estructura)
    getCamposFormulario: function(modulo) {
        const config = this.getModuloConfig(modulo);
        return config ? config.columnasFormulario || [] : [];
    },

    // Obtener columnas de tabla (nueva estructura)
    getColumnasTabla: function(modulo) {
        const config = this.getModuloConfig(modulo);
        return config ? config.columnasTablas || [] : [];
    },

    // Obtener título de formulario
    getTituloFormulario: function(modulo, esEdicion = false, id = null) {
        const nombre = this.getNombreSingular(modulo);
        if (esEdicion) {
            return `Editar ${nombre}${id ? ` #${id}` : ''}`;
        } else {
            return `Nuevo ${nombre}`;
        }
    },

    // Capitalizar texto
    capitalize: function(texto) {
        return texto.charAt(0).toUpperCase() + texto.slice(1);
    },

    // Obtener todos los módulos configurados
    getModulosConfigurados: function() {
        return Object.keys(CONFIGURACION_SISTEMA.modulos);
    },

    // Verificar si un módulo existe
    existeModulo: function(modulo) {
        return !!CONFIGURACION_SISTEMA.modulos[modulo];
    },

    // Obtener descripción del módulo
    getDescripcionModulo: function(modulo) {
        const config = this.getModuloConfig(modulo);
        return config ? config.descripcion : 'Sin descripción disponible';
    },

    // Debug: mostrar configuración completa
    debug: function() {
        console.group('🔧 CONFIGURACIÓN COMPLETA DEL SISTEMA');
        console.log('🏢 Sistema:', CONFIGURACION_SISTEMA.sistema);
        console.log('📦 Módulos configurados:', this.getModulosConfigurados());
        
        const modulosConFormularios = this.getModulosConfigurados().filter(mod => {
            const config = this.getModuloConfig(mod);
            return config && config.columnasFormulario && config.columnasFormulario.length > 0;
        });
        
        const modulosConTablas = this.getModulosConfigurados().filter(mod => {
            const config = this.getModuloConfig(mod);
            return config && config.columnasTablas && config.columnasTablas.length > 0;
        });
        
        console.log('📋 Módulos con formularios:', modulosConFormularios);
        console.log('📊 Módulos con tablas:', modulosConTablas);
        console.groupEnd();
    },

    // Validar integridad de la configuración
    validarConfiguracion: function() {
        const modulos = this.getModulosConfigurados();
        const errores = [];

        modulos.forEach(modulo => {
            const config = this.getModuloConfig(modulo);
            
            // Validar propiedades básicas
            if (!config.singular) errores.push(`${modulo}: falta 'singular'`);
            if (!config.plural) errores.push(`${modulo}: falta 'plural'`);
            if (!config.icono) errores.push(`${modulo}: falta 'icono'`);
            
            // Validar columnas de formulario
            if (!config.columnasFormulario || !Array.isArray(config.columnasFormulario)) {
                errores.push(`${modulo}: 'columnasFormulario' debe ser un array`);
            }
            
            // Validar columnas de tabla
            if (!config.columnasTablas || !Array.isArray(config.columnasTablas)) {
                errores.push(`${modulo}: 'columnasTablas' debe ser un array`);
            }
        });

        if (errores.length > 0) {
            console.error('❌ Errores de configuración:', errores);
            return false;
        } else {
            console.log('✅ Configuración válida');
            return true;
        }
    }
};

// ===== HACER DISPONIBLE GLOBALMENTE =====
if (typeof window !== 'undefined') {
    window.CONFIGURACION_SISTEMA = CONFIGURACION_SISTEMA;
    window.ConfigUtil = ConfigUtil;
    
    // Mantener compatibilidad con código existente - ESTRUCTURA ANTERIOR
    window.nombresModulosConfig = {};
    window.camposConfig = {};
    window.columnasConfig = {};

    // Convertir nueva estructura a antigua estructura para compatibilidad
    Object.keys(CONFIGURACION_SISTEMA.modulos).forEach(modulo => {
        const config = CONFIGURACION_SISTEMA.modulos[modulo];
        
        // Nombres de módulos
        window.nombresModulosConfig[modulo] = {
            singular: config.singular,
            plural: config.plural,
            icono: config.icono,
            genero: config.genero,
            descripcion: config.descripcion
        };
        
        // Campos de formulario
        window.camposConfig[modulo] = config.columnasFormulario || [];
        
        // Columnas de tabla
        window.columnasConfig[modulo] = config.columnasTablas || [];
    });
    
    console.log('✅ ConfigUtil cargado con nueva estructura');
    console.log('🔄 Variables de compatibilidad generadas');
}
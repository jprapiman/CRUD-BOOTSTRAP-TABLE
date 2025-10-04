// config-validaciones.js - Validaciones usando configuración por módulo
class ConfigValidaciones {
    static validarConfiguracionCompleta() {
        if (!window.configManager) {
            throw new Error('ConfigManager no disponible');
        }
        
        const advertencias = [];
        const errores = [];
        
        // Validar cada módulo individualmente
        const modulos = window.configManager.getModulosConfigurados();
        
        modulos.forEach(modulo => {
            const moduloConfig = window.configManager.getModuloConfig(modulo);
            
            // Validar propiedades básicas
            if (!moduloConfig.tabId) {
                advertencias.push(`Módulo ${modulo} no tiene tabId, usando: ${modulo.replace(/_/g, '-')}`);
            }
            
            if (!moduloConfig.tableId) {
                advertencias.push(`Módulo ${modulo} no tiene tableId, usando: tabla${this.capitalize(modulo)}`);
            }
            
            // Validar configuración crítica
            if (!moduloConfig.columnasFormulario || moduloConfig.columnasFormulario.length === 0) {
                advertencias.push(`Módulo ${modulo} no tiene columnasFormulario configuradas`);
            }
            
            if (!moduloConfig.columnasTablas || moduloConfig.columnasTablas.length === 0) {
                errores.push(`Módulo ${modulo} no tiene columnasTablas configuradas`);
            }
            
            if (!moduloConfig.singular) {
                errores.push(`Módulo ${modulo} no tiene nombre singular configurado`);
            }
            
            if (!moduloConfig.plural) {
                errores.push(`Módulo ${modulo} no tiene nombre plural configurado`);
            }
        });
        
        // Validar orden de módulos
        if (!window.configManager.config.ordenModulos) {
            advertencias.push('No hay orden de módulos configurado, usando orden alfabético');
        }
        
        if (advertencias.length > 0) {
            console.warn('⚠️ Advertencias de configuración:', advertencias);
        }
        
        if (errores.length > 0) {
            console.error('❌ Errores críticos de configuración:', errores);
            return false;
        }
        
        console.log('✅ Configuración de módulos validada correctamente');
        return true;
    }
    
    static obtenerTabId(modulo) {
        if (!window.configManager) {
            return modulo.replace(/_/g, '-');
        }
        
        return window.configManager.getTabIdPorModulo(modulo);
    }
    
    static obtenerTableId(modulo) {
        if (!window.configManager) {
            return `tabla${this.capitalize(modulo)}`;
        }
        
        return window.configManager.getTableIdPorModulo(modulo);
    }
    
    static capitalize(str) {
        return str.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join('');
    }
    
    // Método para debug de configuración de módulos
    static debugConfiguracionModulos() {
        if (!window.configManager) {
            console.error('ConfigManager no disponible');
            return;
        }
        
        const modulos = window.configManager.getOrdenModulos();
        console.group('🔍 DEBUG - Configuración de Módulos');
        
        modulos.forEach(modulo => {
            const config = window.configManager.getModuloConfig(modulo);
            const completo = window.configManager.tieneConfiguracionCompleta(modulo);
            
            console.log(
                `${modulo}:`, 
                `tabId="${config.tabId}"`, 
                `tableId="${config.tableId}"`,
                `✅ ${completo ? 'COMPLETO' : 'INCOMPLETO'}`
            );
        });
        
        console.groupEnd();
    }
    
    // Validar que no hay tabIds duplicados
    static validarTabIdsUnicos() {
        if (!window.configManager) return true;
        
        const modulos = window.configManager.getModulosConfigurados();
        const tabIds = new Set();
        const duplicados = [];
        
        modulos.forEach(modulo => {
            const tabId = window.configManager.getTabIdPorModulo(modulo);
            if (tabIds.has(tabId)) {
                duplicados.push(`TabId duplicado: ${tabId} (módulo: ${modulo})`);
            }
            tabIds.add(tabId);
        });
        
        if (duplicados.length > 0) {
            console.error('❌ TabIds duplicados:', duplicados);
            return false;
        }
        
        return true;
    }
}

// Hacer disponible globalmente
window.ConfigValidaciones = ConfigValidaciones;
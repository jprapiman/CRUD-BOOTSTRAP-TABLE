// config-validaciones.js - Validaciones usando configuración central
class ConfigValidaciones {
    static validarMapeosCompletos() {
        if (!window.configManager) {
            throw new Error('ConfigManager no disponible');
        }
        
        const config = window.configManager.config;
        const advertencias = [];
        const errores = [];
        
        // Validar que todos los módulos tengan mapeos
        const modulos = Object.keys(config.modulos);
        
        modulos.forEach(modulo => {
            // Obtener tabId - puede ser configurado o por defecto
            const tabId = this.obtenerTabIdConfigurado(modulo);
            if (!tabId) {
                advertencias.push(`Módulo ${modulo} usando tabId por defecto: ${modulo}`);
            }
            
            // Obtener tableId - puede ser configurado o por defecto
            const tableId = this.obtenerTableIdConfigurado(modulo);
            if (!tableId) {
                advertencias.push(`Módulo ${modulo} usando tableId por defecto: tabla${this.capitalize(modulo)}`);
            }
            
            // Verificar que el módulo tenga configuración completa (más importante)
            const moduloConfig = config.modulos[modulo];
            if (!moduloConfig.columnasFormulario || moduloConfig.columnasFormulario.length === 0) {
                errores.push(`Módulo ${modulo} no tiene columnasFormulario configuradas`);
            }
            
            if (!moduloConfig.columnasTablas || moduloConfig.columnasTablas.length === 0) {
                errores.push(`Módulo ${modulo} no tiene columnasTablas configuradas`);
            }
        });
        
        if (advertencias.length > 0) {
            console.warn('⚠️ Advertencias de mapeos:', advertencias);
        }
        
        if (errores.length > 0) {
            console.error('❌ Errores críticos de configuración:', errores);
            return false;
        }
        
        console.log('✅ Configuración validada correctamente');
        return true;
    }
    
    static obtenerTabIdConfigurado(modulo) {
        if (!window.configManager) return modulo; // Fallback básico
        
        // Buscar en configuración explícita
        const tabIdConfigurado = window.configManager.config.mapeos?.moduloToTabId?.[modulo];
        if (tabIdConfigurado) {
            return tabIdConfigurado;
        }
        
        // Para módulos sin guiones, usar el mismo nombre
        if (!modulo.includes('_')) {
            return modulo;
        }
        
        // Para módulos con guiones, generar uno por defecto
        return modulo.replace(/_/g, '-');
    }
    
    static obtenerTableIdConfigurado(modulo) {
        if (!window.configManager) return `tabla${this.capitalize(modulo)}`;
        
        // Buscar en configuración explícita
        const tableIdConfigurado = window.configManager.config.mapeos?.moduloToTableId?.[modulo];
        if (tableIdConfigurado) {
            return tableIdConfigurado;
        }
        
        // Generar tableId por defecto
        return `tabla${this.capitalize(modulo)}`;
    }
    
    static obtenerTabId(modulo) {
        const tabId = this.obtenerTabIdConfigurado(modulo);
        console.log(`🔗 TabId para ${modulo}: ${tabId}`);
        return tabId;
    }
    
    static obtenerTableId(modulo) {
        const tableId = this.obtenerTableIdConfigurado(modulo);
        console.log(`🔗 TableId para ${modulo}: ${tableId}`);
        return tableId;
    }
    
    static capitalize(str) {
        return str.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join('');
    }
    
    // Método para debug de todos los mapeos
    static debugMapeos() {
        if (!window.configManager) {
            console.error('ConfigManager no disponible');
            return;
        }
        
        const modulos = Object.keys(window.configManager.config.modulos);
        console.group('🔍 DEBUG - Mapeos de módulos');
        
        modulos.forEach(modulo => {
            const tabId = this.obtenerTabIdConfigurado(modulo);
            const tableId = this.obtenerTableIdConfigurado(modulo);
            console.log(`${modulo}: tabId="${tabId}", tableId="${tableId}"`);
        });
        
        console.groupEnd();
    }
}

// Hacer disponible globalmente
window.ConfigValidaciones = ConfigValidaciones;
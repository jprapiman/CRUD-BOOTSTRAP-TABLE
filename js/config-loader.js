// config-loader.js - Cargador de configuración desde API

class ConfigLoader {
    constructor() {
        this.configUrl = 'api/configuracion.php';
        this.config = null;
        this.loaded = false;
    }

    async cargarConfiguracion() {
        console.log('📡 Cargando configuración desde el servidor...');
        
        try {
            const response = await fetch(this.configUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.config = await response.json();
            this.loaded = true;
            
            // Hacer disponible globalmente
            window.CONFIGURACION_SISTEMA = this.config;
            
            console.log('✅ Configuración cargada correctamente desde BD');
            console.log('📦 Módulos encontrados:', Object.keys(this.config.modulos || {}).length);
            
            // Disparar evento personalizado
            const evento = new CustomEvent('configuracionCargada', {
                detail: { config: this.config }
            });
            document.dispatchEvent(evento);
            
            return this.config;
            
        } catch (error) {
            console.error('❌ Error cargando configuración:', error);
            throw error;
        }
    }

    getConfig() {
        return this.config;
    }

    isLoaded() {
        return this.loaded;
    }
}

// Instancia global
window.configLoader = new ConfigLoader();
// inicializador.js - Gestor completo de carga de scripts e inicialización

class CargadorScripts {
    constructor() {
        this.scriptsConfig = {
            // Orden específico de carga - CRÍTICO MANTENER ESTE ORDEN
            scripts: [
                // 1. Configuración (debe cargarse primero)
                'js/config-loader.js',      // NUEVO: cargador de config desde API
                'js/config-manager.js',
                'js/config-validaciones.js',
                
                // 2. Sistemas de UI
                'js/notificaciones.js',
                
                // 3. Core de la aplicación
                'js/app.js',
                
                // 4. Sistemas de UI adicionales
                'js/validador.js',
                'js/generador-html.js',
                'js/modales.js'
            ],
            
            // Configuración de carga
            timeout: 30000, // 30 segundos timeout por script
            reintentos: 3
        };
        
        this.scriptsExitosos = [];
        this.scriptsFallidos = [];
        this.inicializado = false;
        this.estructuraGenerada = false;
        this.configCargada = false;
    }

    // Método principal de inicialización
    async inicializar() {
        console.log('🚀 Iniciando carga dinámica de scripts...');
        
        try {
            // PASO 1: Verificar dependencias básicas primero
            this.verificarDependenciasBasicas();
            
            // PASO 2: Cargar configuración desde API ANTES de cargar scripts
            console.log('📡 Cargando configuración desde servidor...');
            await this.cargarConfiguracionDesdeAPI();
            
            // PASO 3: Cargar scripts en orden
            await this.cargarScriptsEnOrden();
            
            // PASO 4: Configurar eventos después de que todos los scripts estén cargados
            this.configurarEventos();
            
            console.log('✅ Inicialización completa exitosa');
            this.inicializado = true;
            
        } catch (error) {
            console.error('❌ Error crítico en inicialización:', error);
            this.manejarErrorCritico(error);
        }
    }

    // NUEVO: Cargar configuración desde API
    async cargarConfiguracionDesdeAPI() {
        const maxIntentos = 3;
        let intento = 0;
        
        while (intento < maxIntentos) {
            try {
                console.log(`📡 Intentando cargar configuración (intento ${intento + 1}/${maxIntentos})...`);
                
                const response = await fetch('api/configuracion.php', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    },
                    cache: 'no-cache'
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const config = await response.json();
                
                // Validar que la configuración tenga la estructura mínima esperada
                if (!config.sistema || !config.modulos) {
                    throw new Error('Configuración inválida: faltan propiedades requeridas');
                }
                
                // Hacer disponible globalmente
                window.CONFIGURACION_SISTEMA = config;
                this.configCargada = true;
                
                console.log('✅ Configuración cargada desde API');
                console.log('📦 Módulos encontrados:', Object.keys(config.modulos || {}).length);
                
                // Disparar evento de configuración cargada
                const evento = new CustomEvent('configuracionCargada', {
                    detail: { config: config, source: 'api' }
                });
                document.dispatchEvent(evento);
                
                return config;
                
            } catch (error) {
                intento++;
                console.warn(`⚠️ Error cargando configuración (intento ${intento}):`, error.message);
                
                if (intento >= maxIntentos) {
                    throw new Error(`No se pudo cargar la configuración después de ${maxIntentos} intentos: ${error.message}`);
                }
                
                // Esperar antes del siguiente intento
                await this.esperar(1000 * intento);
            }
        }
    }

    // Verificar que las dependencias básicas (jQuery, Bootstrap) estén disponibles
    verificarDependenciasBasicas() {
        const dependenciasBasicas = [
            { nombre: 'jQuery', check: () => typeof $ !== 'undefined' },
            { nombre: 'Bootstrap', check: () => typeof bootstrap !== 'undefined' }
        ];

        dependenciasBasicas.forEach(dep => {
            if (!dep.check()) {
                throw new Error(`Dependencia básica faltante: ${dep.nombre}`);
            }
        });

        console.log('✅ Dependencias básicas verificadas');
    }

    // Cargar scripts en el orden especificado
    async cargarScriptsEnOrden() {
        console.log(`📦 Cargando ${this.scriptsConfig.scripts.length} scripts en orden...`);
        
        for (const script of this.scriptsConfig.scripts) {
            // Saltar config-loader.js si ya cargamos la config desde API
            if (script.includes('config-loader') && this.configCargada) {
                console.log(`⏭️ Saltando ${script} (configuración ya cargada desde API)`);
                this.scriptsExitosos.push(script);
                continue;
            }
            
            await this.cargarScript(script);
            
            // Verificar si se completó cada etapa importante
            if (script.includes('config-manager')) {
                await this.esperarConfigManager();
            } else if (script.includes('generador-html')) {
                await this.esperarGeneradorHTML();
            }
        }
        
        console.log('✅ Todos los scripts cargados exitosamente');
    }

    // Esperar a que ConfigManager esté disponible
    async esperarConfigManager() {
        let intentos = 0;
        const maxIntentos = 50; // 5 segundos máximo
        
        while (!window.configManager && intentos < maxIntentos) {
            await this.esperar(100);
            intentos++;
        }
        
        if (window.configManager) {
            console.log('✅ ConfigManager verificado');
        } else {
            console.warn('⚠️ ConfigManager no se inicializó correctamente');
        }
    }
    
    // Esperar a que GeneradorHTML esté disponible
    async esperarGeneradorHTML() {
        let intentos = 0;
        const maxIntentos = 50; // 5 segundos máximo
        
        while (!window.generadorHTML && intentos < maxIntentos) {
            await this.esperar(100);
            intentos++;
        }
        
        if (window.generadorHTML) {
            console.log('✅ GeneradorHTML verificado');
            
            // Generar interfaz automáticamente
            const contenedor = document.getElementById('app-container');
            if (contenedor) {
                console.log('🎯 Generando interfaz automáticamente...');
                window.generadorHTML.inyectarEnDOM('app-container');
            }
        } else {
            console.warn('⚠️ GeneradorHTML no se inicializó correctamente');
        }
    }

    // Cargar un script individual con reintentos
    async cargarScript(src) {
        for (let intento = 1; intento <= this.scriptsConfig.reintentos; intento++) {
            try {
                console.log(`📄 Cargando: ${src} (intento ${intento})`);
                await this.cargarScriptPromise(src);
                
                this.scriptsExitosos.push(src);
                console.log(`✅ ${src} cargado exitosamente`);
                return;
                
            } catch (error) {
                console.warn(`⚠️ Error cargando ${src} (intento ${intento}):`, error.message);
                
                if (intento === this.scriptsConfig.reintentos) {
                    this.scriptsFallidos.push({ src, error: error.message });
                    throw new Error(`Falló cargar ${src} después de ${this.scriptsConfig.reintentos} intentos`);
                }
                
                // Esperar antes del siguiente intento
                await this.esperar(1000 * intento);
            }
        }
    }

    // Promesa para cargar un script
    cargarScriptPromise(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = false; // Mantener orden
            
            const timeout = setTimeout(() => {
                reject(new Error(`Timeout cargando ${src}`));
            }, this.scriptsConfig.timeout);

            script.onload = () => {
                clearTimeout(timeout);
                resolve();
            };

            script.onerror = () => {
                clearTimeout(timeout);
                reject(new Error(`Error de red cargando ${src}`));
            };

            document.head.appendChild(script);
        });
    }

    // Utilidad para esperar
    esperar(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Configurar eventos después de cargar scripts
    configurarEventos() {
        // Evento de estructura HTML generada
        document.addEventListener('estructuraHTMLGenerada', (event) => {
            console.log('Estructura HTML generada:', event.detail);
            this.manejarEstructuraGenerada(event);
        });

        // Manejo de errores globales
        window.addEventListener('error', (event) => {
            console.error('Error en la aplicación:', event.error);
            this.manejarError(event.error);
        });

        // Promesas no capturadas
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promise rechazada:', event.reason);
            this.manejarError(event.reason);
        });

        console.log('✅ Eventos configurados');
    }

    // Manejar estructura generada
    manejarEstructuraGenerada(event) {
        if (this.estructuraGenerada) {
            console.log('Aplicación ya inicializada, omitiendo...');
            return;
        }

        console.log('🏗️ Iniciando configuración post-generación HTML...');
        
        // Dar más tiempo para que el DOM se estabilice completamente
        setTimeout(() => {
            try {
                this.ejecutarInicializacionCompleta(event.detail);
                this.estructuraGenerada = true;
                
                // FORZAR INICIALIZACIÓN DEL SISTEMA DESPUÉS DE QUE EL DOM ESTÉ LISTO
                setTimeout(() => {
                    if (typeof inicializarSistema === 'function') {
                        console.log('🎯 Ejecutando inicializarSistema desde inicializador...');
                        inicializarSistema();
                        
                        // Cargar el primer módulo automáticamente después de que el sistema esté listo
                        setTimeout(() => {
                            console.log('🎯 Intentando cargar primer módulo...');
                            if (typeof cargarPrimerModulo === 'function') {
                                cargarPrimerModulo();
                            } else {
                                console.error('❌ cargarPrimerModulo no está definido');
                            }
                        }, 1500);
                    } else {
                        console.error('❌ inicializarSistema no está disponible');
                    }
                }, 500);
                
            } catch (error) {
                console.error('Error en inicialización completa:', error);
                this.manejarError(error);
            }
        }, 200);
    }

    // Ejecutar inicialización completa
    ejecutarInicializacionCompleta(detalles) {
        // Validar configuración completa de módulos
        if (window.ConfigValidaciones) {
            const configValida = window.ConfigValidaciones.validarConfiguracionCompleta();
            const tabIdsUnicos = window.ConfigValidaciones.validarTabIdsUnicos();
            
            if (configValida && tabIdsUnicos) {
                console.log('✅ Configuración de módulos validada correctamente');
            }
        }
        
        // Mostrar estadísticas de módulos
        if (window.configManager) {
            const modulosCompletos = window.configManager.getModulosCompletos();
            console.log(`📊 Módulos completamente configurados: ${modulosCompletos.length}/${window.configManager.getModulosConfigurados().length}`);
        }
        
        this.mostrarMensajeBienvenida();
        
        console.log('Inicialización completa finalizada correctamente');
    }

    // Mostrar mensaje de bienvenida
    mostrarMensajeBienvenida() {
        setTimeout(() => {
            console.log(
                '%c🏪 CRUD Manager cargado dinámicamente desde BD', 
                'color: #0d6efd; font-size: 16px; font-weight: bold;'
            );
            
            const modulos = window.configManager ? 
                window.configManager.getModulosConfigurados() : 
                'Cargando...';
                
            console.log(
                '%c📋 Módulos disponibles:', 
                'color: #198754; font-weight: bold;', 
                modulos
            );

            console.log(
                '%c📦 Scripts cargados:', 
                'color: #6f42c1; font-weight: bold;', 
                this.scriptsExitosos.length
            );
            
            console.log(
                '%c💾 Configuración desde:', 
                'color: #fd7e14; font-weight: bold;', 
                'Base de Datos PostgreSQL'
            );
        }, 2000);
    }

    // Manejar errores
    manejarError(error) {
        // Solo mostrar notificación si está disponible
        if (window.sistemaNotificaciones) {
            const mensaje = error.message || 'Error desconocido en la aplicación';
            window.sistemaNotificaciones.error(`Error: ${mensaje}`);
        }

        // Log detallado para debugging
        console.group('Error en aplicación');
        console.error('Error:', error);
        console.error('Stack:', error.stack);
        console.error('Scripts exitosos:', this.scriptsExitosos);
        console.error('Scripts fallidos:', this.scriptsFallidos);
        console.error('Estado inicialización:', this.inicializado);
        console.error('Configuración cargada:', this.configCargada);
        console.groupEnd();
    }

    // Manejar error crítico
    manejarErrorCritico(error) {
        console.error('💥 ERROR CRÍTICO:', error);
        
        // Mostrar información de error
        const contenedor = document.getElementById('app-container');
        if (contenedor && window.generadorHTML) {
            contenedor.innerHTML = window.generadorHTML.generarErrorCriticoHTML(
                error, 
                this.scriptsExitosos, 
                this.scriptsFallidos
            );
        } else {
            // Fallback si GeneradorHTML no está disponible
            contenedor.innerHTML = `
                <div class="container mt-5">
                    <div class="alert alert-danger">
                        <h4>Error Crítico de Inicialización</h4>
                        <p>${error.message}</p>
                        <button class="btn btn-danger" onclick="location.reload()">
                            Recargar Página
                        </button>
                    </div>
                </div>
            `;
        }
    }

    // Método para reinicializar
    async reinicializar() {
        console.log('🔄 Reinicializando aplicación...');
        this.inicializado = false;
        this.estructuraGenerada = false;
        this.configCargada = false;
        this.scriptsExitosos = [];
        this.scriptsFallidos = [];
        
        try {
            await this.inicializar();
            if (window.sistemaNotificaciones) {
                window.sistemaNotificaciones.info('Aplicación reinicializada');
            }
        } catch (error) {
            this.manejarErrorCritico(error);
        }
    }

    // Obtener estadísticas
    getEstadisticas() {
        return {
            scriptsExitosos: this.scriptsExitosos.length,
            scriptsFallidos: this.scriptsFallidos.length,
            scriptsTotal: this.scriptsConfig.scripts.length,
            inicializado: this.inicializado,
            configCargada: this.configCargada,
            porcentajeExito: Math.round((this.scriptsExitosos.length / this.scriptsConfig.scripts.length) * 100)
        };
    }
}

// Inicialización automática cuando se carga el script
const cargadorScripts = new CargadorScripts();

// Hacer disponible globalmente
window.cargadorScripts = cargadorScripts;

// Iniciar la carga automáticamente
cargadorScripts.inicializar().then(() => {
    console.log('✅ Sistema completamente inicializado desde BD');
}).catch(error => {
    console.error('❌ Error en inicialización automática:', error);
});
// inicializador.js - Gestor completo de carga de scripts e inicialización

class CargadorScripts {
    constructor() {
        this.scriptsConfig = {
            // Orden específico de carga - CRÍTICO MANTENER ESTE ORDEN
            scripts: [
				// 1. Configuración (debe cargarse primero)
				'js/configuracion-completa.js',
				'js/config-manager.js',
				'js/config-validaciones.js', // NUEVO
				
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
    }

    // Método principal de inicialización
    async inicializar() {
        console.log('🚀 Iniciando carga dinámica de scripts...');
        
        try {
            // Verificar dependencias básicas primero
            this.verificarDependenciasBasicas();
            
            // Cargar scripts en orden
            await this.cargarScriptsEnOrden();
            
            // Configurar eventos después de que todos los scripts estén cargados
            this.configurarEventos();
            
            console.log('✅ Inicialización completa exitosa');
            this.inicializado = true;
            
        } catch (error) {
            console.error('❌ Error crítico en inicialización:', error);
            this.manejarErrorCritico(error);
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

    // Manejar estructura generada// En el método manejarEstructuraGenerada, reemplaza esta parte:
	// En el método manejarEstructuraGenerada, reemplaza esta parte:
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
								// Intentar cargar el primer módulo manualmente
								cargarPrimerModuloManual();
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
			
			// Debug opcional
			if (window.location.hash === '#debug-modulos') {
				window.ConfigValidaciones.debugConfiguracionModulos();
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

    // Verificar dependencias principales
    verificarDependenciasPrincipales() {
        const dependencias = {
            configuracion: typeof CONFIGURACION_SISTEMA !== 'undefined',
            configManager: typeof window.configManager !== 'undefined',
            generadorHTML: typeof window.generadorHTML !== 'undefined',
            sistemaNotificaciones: typeof window.sistemaNotificaciones !== 'undefined',
            sistemaValidacion: typeof window.sistemaValidacion !== 'undefined'
        };

        const faltantes = Object.keys(dependencias).filter(dep => !dependencias[dep]);
        
        return {
            todas: faltantes.length === 0,
            faltantes: faltantes,
            detalles: dependencias
        };
    }

    // Mostrar mensaje de bienvenida
    mostrarMensajeBienvenida() {
        setTimeout(() => {
            console.log(
                '%c🏪 CRUD Manager cargado dinámicamente', 
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
        console.groupEnd();
    }

    // Manejar error crítico
	manejarErrorCritico(error) {
		console.error('💥 ERROR CRÍTICO:', error);
		
		// Mostrar información de error usando GeneradorHTML
		const contenedor = document.getElementById('app-container');
		if (contenedor) {
			contenedor.innerHTML = window.generadorHTML.generarErrorCriticoHTML(
				error, 
				this.scriptsExitosos, 
				this.scriptsFallidos
			);
		}
	}

    // Método para reinicializar
    async reinicializar() {
        console.log('🔄 Reinicializando aplicación...');
        this.inicializado = false;
        this.estructuraGenerada = false;
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
    console.log('Sistema completamente inicializado');
}).catch(error => {
    console.error('Error en inicialización automática:', error);
});
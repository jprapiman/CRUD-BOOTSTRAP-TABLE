// inicializador.js - Gestor completo de carga de scripts e inicialización

class CargadorScripts {
    constructor() {
        this.scriptsConfig = {
            // Orden específico de carga - CRÍTICO MANTENER ESTE ORDEN
            // En la sección scriptsConfig, cambia el orden:
			scripts: [
				// 1. Configuración (debe cargarse primero)
				'js/configuracion-completa.js',
				'js/config-util.js', 
				'js/config-manager.js',
							
				// 2. Sistemas de UI (notificaciones antes que app)
				'js/notificaciones.js',
				// 2. Core de la aplicación
				'js/app.js',
				
				// 3. Sistemas de UI
				'js/validador.js',
				'js/generador-html.js',
				'js/modales.js'
			],
            
            // Scripts opcionales que se pueden cargar en paralelo
            opcionales: [],
            
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

    // Manejar estructura generada
    // En inicializador.js, mejora el manejo de la estructura generada
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
					} else {
						console.error('❌ inicializarSistema no está disponible');
					}
				}, 1000);
				
			} catch (error) {
				console.error('Error en inicialización completa:', error);
				this.manejarError(error);
			}
		}, 200);
	}
    // Ejecutar inicialización completa
    ejecutarInicializacionCompleta(detalles) {
        // Mostrar notificación de éxito si está disponible
        setTimeout(() => {
            if (window.sistemaNotificaciones) {
                window.sistemaNotificaciones.exito('Interfaz cargada dinámicamente');
            }
        }, 500);

        // Ejecutar debug si está habilitado
        if (this.debugHabilitado()) {
            this.ejecutarDebug(detalles);
        }

        // Mostrar mensaje de bienvenida
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

    // Verificar si debug está habilitado
    debugHabilitado() {
        return window.location.hash.includes('debug') || 
               window.location.search.includes('debug=true') ||
               (CONFIGURACION_SISTEMA?.debug?.habilitado === true);
    }

    // Ejecutar debug completo
    ejecutarDebug(detalles) {
        console.group('Debug habilitado - Información completa');
        console.log('📦 Scripts cargados:', this.scriptsExitosos);
        console.log('❌ Scripts fallidos:', this.scriptsFallidos);
        console.log('🏗️ Módulos generados:', detalles.modulos);
        console.log('⚙️ ConfigManager:', window.configManager);
        console.log('🎨 GeneradorHTML:', window.generadorHTML);
        console.log('📢 Sistema Notificaciones:', window.sistemaNotificaciones);
        console.log('✅ Sistema Validación:', window.sistemaValidacion);
        console.log('🔗 API Client:', window.api);
        console.log('📊 Table Manager:', window.tableManager);
        console.log('🎯 Modal Manager:', window.modalManager);
        console.groupEnd();

        // Debug de cada componente si está disponible
        ['configManager', 'generadorHTML', 'sistemaNotificaciones', 'sistemaValidacion'].forEach(componente => {
            if (window[componente] && typeof window[componente].debug === 'function') {
                window[componente].debug();
            }
        });
    }

    // Mostrar mensaje de bienvenida
    mostrarMensajeBienvenida() {
        setTimeout(() => {
            console.log(
                '%c🏪 Minimarket Manager cargado dinámicamente', 
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

            // Información adicional para desarrollo
            if (this.debugHabilitado()) {
                console.log('%cModo debug activo - Funciones disponibles:', 'color: #ffc107; font-weight: bold;');
                console.log('- debugApp() - Debug completo de la aplicación');
                console.log('- recargarInterfaz() - Recargar interfaz dinámicamente');
                console.log('- infoSistema() - Información del sistema');
                console.log('- reiniciarApp() - Reiniciar aplicación');
            }
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
        
        // Mostrar en UI básica si no hay notificaciones
        if (!window.sistemaNotificaciones) {
            alert(`Error crítico cargando la aplicación: ${error.message}`);
        }

        // Mostrar información de fallback
        const contenedor = document.getElementById('app-container');
        if (contenedor) {
            contenedor.innerHTML = `
                <div class="container mt-5">
                    <div class="alert alert-danger" role="alert">
                        <h4 class="alert-heading">Error Crítico</h4>
                        <p>No se pudo cargar la aplicación completamente.</p>
                        <hr>
                        <p class="mb-0">
                            <strong>Error:</strong> ${error.message}<br>
                            <strong>Scripts cargados:</strong> ${this.scriptsExitosos.join(', ')}<br>
                            <strong>Scripts fallidos:</strong> ${this.scriptsFallidos.map(f => f.src).join(', ')}
                        </p>
                        <button class="btn btn-outline-danger mt-3" onclick="location.reload()">
                            <i class="fas fa-sync"></i> Recargar Página
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

// Funciones globales de utilidad
function debugApp() {
    console.group('🔍 Debug completo de la aplicación');
    console.log('CargadorScripts:', window.cargadorScripts);
    console.log('Estadísticas carga:', window.cargadorScripts?.getEstadisticas());
    console.log('ConfigManager:', window.configManager);
    console.log('GeneradorHTML:', window.generadorHTML);
    console.log('Sistema Notificaciones:', window.sistemaNotificaciones);
    console.log('Sistema Validación:', window.sistemaValidacion);
    console.log('API Client:', window.api);
    console.log('Table Manager:', window.tableManager);
    console.log('Modal Manager:', window.modalManager);
    console.groupEnd();
}

function recargarInterfaz() {
    if (window.generadorHTML) {
        console.log('🔄 Recargando interfaz dinámicamente...');
        window.generadorHTML.inyectarEnDOM('app-container');
        
        if (window.sistemaNotificaciones) {
            window.sistemaNotificaciones.info('Interfaz recargada');
        }
    } else {
        console.error('GeneradorHTML no disponible para recargar');
    }
}

function reiniciarApp() {
    if (window.cargadorScripts) {
        window.cargadorScripts.reinicializar();
    } else {
        console.error('CargadorScripts no disponible');
        location.reload();
    }
}

function infoSistema() {
    const info = {
        configuracion: window.CONFIGURACION_SISTEMA?.sistema || 'No disponible',
        modulos: window.configManager ? 
            window.configManager.getModulosConfigurados().length : 
            'No disponible',
        carga: window.cargadorScripts ? 
            window.cargadorScripts.getEstadisticas() : 
            'No disponible',
        componentes: {
            notificaciones: !!window.sistemaNotificaciones,
            validacion: !!window.sistemaValidacion,
            generadorHTML: !!window.generadorHTML,
            api: !!window.api,
            tableManager: !!window.tableManager,
            modalManager: !!window.modalManager
        }
    };

    console.table(info);
    return info;
}

// Inicialización automática cuando se carga el script
const cargadorScripts = new CargadorScripts();

// Hacer disponible globalmente
window.cargadorScripts = cargadorScripts;
window.debugApp = debugApp;
window.recargarInterfaz = recargarInterfaz;
window.reiniciarApp = reiniciarApp;
window.infoSistema = infoSistema;

// Iniciar la carga automáticamente
cargadorScripts.inicializar().then(() => {
    console.log('Sistema completamente inicializado');
}).catch(error => {
    console.error('Error en inicialización automática:', error);
});
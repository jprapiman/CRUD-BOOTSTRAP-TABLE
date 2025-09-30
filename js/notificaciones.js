// notificaciones.js - Sistema de notificaciones totalmente configurable

class SistemaNotificaciones {
    constructor() {
        this.config = null;
        this.notificacionesActivas = [];
        this.containerId = 'notificaciones';
        this.inicializar();
    }

    inicializar() {
        if (typeof CONFIGURACION_SISTEMA !== 'undefined') {
            this.config = CONFIGURACION_SISTEMA.notificaciones;
            console.log('✅ SistemaNotificaciones inicializado con configuración');
            this.crearContainer();
        } else {
            console.error('❌ CONFIGURACION_SISTEMA no encontrada para notificaciones');
            // Configuración por defecto
            this.config = {
				duracion: 5000,
				posicion: "top-right",
				maxVisible: 3,
				tipos: {
					success: { icono: "bi-check-circle-fill", clase: "alert-success" },
					error: { icono: "bi-exclamation-circle-fill", clase: "alert-danger" },
					warning: { icono: "bi-exclamation-triangle-fill", clase: "alert-warning" },
					info: { icono: "bi-info-circle-fill", clase: "alert-info" }
				}
            };
        }
    }

    // Crear contenedor de notificaciones si no existe
    crearContainer() {
        let container = document.getElementById(this.containerId);
        
        if (!container) {
            container = document.createElement('div');
            container.id = this.containerId;
            container.className = this.obtenerClasesPosicion();
            document.body.appendChild(container);
            console.log('✅ Contenedor de notificaciones creado');
        }
    }

    // Obtener clases CSS según la posición configurada
    obtenerClasesPosicion() {
        const posicionesMap = {
            'top-right': 'position-fixed top-0 end-0 p-3',
            'top-left': 'position-fixed top-0 start-0 p-3',
            'bottom-right': 'position-fixed bottom-0 end-0 p-3',
            'bottom-left': 'position-fixed bottom-0 start-0 p-3',
            'top-center': 'position-fixed top-0 start-50 translate-middle-x p-3',
            'bottom-center': 'position-fixed bottom-0 start-50 translate-middle-x p-3'
        };

        return posicionesMap[this.config.posicion] || posicionesMap['top-right'];
    }

    // Mostrar notificación principal
    mostrar(mensaje, tipo = 'info', opciones = {}) {
        const tipoConfig = this.config.tipos[tipo] || this.config.tipos.info;
        
        const notificacion = {
            id: this.generarId(),
            mensaje: mensaje,
            tipo: tipo,
            titulo: opciones.titulo || tipoConfig.titulo || this.capitalizar(tipo),
            duracion: opciones.duracion || this.config.duracion,
            persistente: opciones.persistente || false,
            icono: opciones.icono || tipoConfig.icono,
            clase: tipoConfig.clase,
            timestamp: new Date()
        };

        this.agregarNotificacion(notificacion);
        return notificacion.id;
    }

    // Agregar notificación al DOM
    agregarNotificacion(notificacion) {
        // Verificar límite máximo de notificaciones visibles
        this.limitarNotificacionesVisibles();

        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error('❌ Contenedor de notificaciones no encontrado');
            return;
        }

        const notificacionElement = this.crearElementoNotificacion(notificacion);
        
        // Agregar al principio o al final según la posición
        if (this.config.posicion.includes('top')) {
            container.insertAdjacentHTML('afterbegin', notificacionElement);
        } else {
            container.insertAdjacentHTML('beforeend', notificacionElement);
        }

        // Registrar notificación activa
        this.notificacionesActivas.push(notificacion);

        // Configurar auto-dismiss si no es persistente
        if (!notificacion.persistente && notificacion.duracion > 0) {
            setTimeout(() => {
                this.cerrar(notificacion.id);
            }, notificacion.duracion);
        }

        // Aplicar animación de entrada
        this.aplicarAnimacionEntrada(notificacion.id);

        console.log(`📢 Notificación mostrada: ${notificacion.tipo} - ${notificacion.mensaje}`);
    }

    // Crear elemento HTML de la notificación
    crearElementoNotificacion(notificacion) {
        return window.generadorHTML.generarNotificacionHTML(notificacion);
    }

    // Aplicar animación de entrada
    aplicarAnimacionEntrada(notificacionId) {
        const elemento = document.getElementById(`notificacion-${notificacionId}`);
        if (!elemento) return;

        // Animación personalizada según configuración
        if (this.config.animacion === 'slide') {
            elemento.style.transform = this.config.posicion.includes('right') ? 
                'translateX(100%)' : 'translateX(-100%)';
            elemento.style.transition = 'transform 0.3s ease-in-out';
            
            setTimeout(() => {
                elemento.style.transform = 'translateX(0)';
            }, 10);
        }
    }

    // Limitar notificaciones visibles
    limitarNotificacionesVisibles() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const notificacionesVisibles = container.querySelectorAll('.alert');
        
        if (notificacionesVisibles.length >= this.config.maxVisible) {
            const exceso = notificacionesVisibles.length - this.config.maxVisible + 1;
            
            for (let i = 0; i < exceso; i++) {
                const notificacionAntigua = this.config.posicion.includes('top') ? 
                    notificacionesVisibles[notificacionesVisibles.length - 1 - i] :
                    notificacionesVisibles[i];
                
                if (notificacionAntigua) {
                    this.cerrarElemento(notificacionAntigua);
                }
            }
        }
    }

    // Cerrar notificación específica
    cerrar(notificacionId) {
        const elemento = document.getElementById(`notificacion-${notificacionId}`);
        if (elemento) {
            this.cerrarElemento(elemento);
        }

        // Remover de notificaciones activas
        this.notificacionesActivas = this.notificacionesActivas.filter(
            notif => notif.id !== notificacionId
        );
    }

    // Cerrar elemento con animación
    cerrarElemento(elemento) {
        if (this.config.animacion === 'fade') {
            elemento.style.transition = 'opacity 0.3s ease-out';
            elemento.style.opacity = '0';
            
            setTimeout(() => {
                elemento.remove();
            }, 300);
        } else {
            elemento.remove();
        }
    }

    // Cerrar todas las notificaciones
    cerrarTodas() {
        const container = document.getElementById(this.containerId);
        if (container) {
            const notificaciones = container.querySelectorAll('.alert');
            notificaciones.forEach(notif => this.cerrarElemento(notif));
        }
        
        this.notificacionesActivas = [];
        console.log('🧹 Todas las notificaciones cerradas');
    }

    // Métodos de conveniencia para diferentes tipos
    exito(mensaje, opciones = {}) {
        return this.mostrar(mensaje, 'success', opciones);
    }

    error(mensaje, opciones = {}) {
        return this.mostrar(mensaje, 'error', { persistente: true, ...opciones });
    }

    advertencia(mensaje, opciones = {}) {
        return this.mostrar(mensaje, 'warning', opciones);
    }

    info(mensaje, opciones = {}) {
        return this.mostrar(mensaje, 'info', opciones);
    }

    // Notificación de carga
    cargando(mensaje = 'Cargando...', opciones = {}) {
        const textos = CONFIGURACION_SISTEMA?.textos?.mensajes || {};
        const mensajeFinal = mensaje || textos.cargando || 'Cargando...';
        
        return this.mostrar(mensajeFinal, 'info', {
            persistente: true,
            icono: 'fa-spinner fa-spin',
            ...opciones
        });
    }

    // Notificación de confirmación con botones
    confirmacion(mensaje, opciones = {}) {
        const notificacionId = this.generarId();
        
        const notificacionHTML = window.generadorHTML.generarConfirmacionHTML(notificacionId, mensaje);

        const container = document.getElementById(this.containerId);
        if (container) {
            container.insertAdjacentHTML('afterbegin', notificacionHTML);
        }

        return new Promise((resolve) => {
            this.notificacionesActivas.push({
                id: notificacionId,
                tipo: 'confirmacion',
                resolve: resolve
            });
        });
    }

    // Manejar confirmación
    confirmar(notificacionId, resultado) {
        const notificacion = this.notificacionesActivas.find(n => n.id === notificacionId);
        if (notificacion && notificacion.resolve) {
            notificacion.resolve(resultado);
        }
        
        this.cerrar(notificacionId);
    }

    // Utilidades
    generarId() {
        return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    capitalizar(texto) {
        return texto.charAt(0).toUpperCase() + texto.slice(1);
    }

    // Obtener estadísticas
    obtenerEstadisticas() {
        return {
            activas: this.notificacionesActivas.length,
            configuracion: this.config,
            porTipo: this.notificacionesActivas.reduce((acc, notif) => {
                acc[notif.tipo] = (acc[notif.tipo] || 0) + 1;
                return acc;
            }, {})
        };
    }
}

// Función global de conveniencia (mantener compatibilidad)
function mostrarNotificacion(mensaje, tipo = 'info', opciones = {}) {
    if (window.sistemaNotificaciones) {
        return window.sistemaNotificaciones.mostrar(mensaje, tipo, opciones);
    } else {
        // Fallback básico si el sistema no está disponible
        console.log(`Notificación ${tipo}: ${mensaje}`);
        alert(`${tipo.toUpperCase()}: ${mensaje}`);
    }
}

// Funciones de conveniencia globales
function mostrarExito(mensaje, opciones = {}) {
    return mostrarNotificacion(mensaje, 'success', opciones);
}

function mostrarError(mensaje, opciones = {}) {
    return mostrarNotificacion(mensaje, 'error', opciones);
}

function mostrarAdvertencia(mensaje, opciones = {}) {
    return mostrarNotificacion(mensaje, 'warning', opciones);
}

function mostrarInfo(mensaje, opciones = {}) {
    return mostrarNotificacion(mensaje, 'info', opciones);
}

function mostrarCargando(mensaje = 'Cargando...') {
    return window.sistemaNotificaciones ? 
        window.sistemaNotificaciones.cargando(mensaje) : 
        console.log('Cargando:', mensaje);
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', function() {
    window.sistemaNotificaciones = new SistemaNotificaciones();
    
    // Hacer funciones disponibles globalmente
    window.mostrarNotificacion = mostrarNotificacion;
    window.mostrarExito = mostrarExito;
    window.mostrarError = mostrarError;
    window.mostrarAdvertencia = mostrarAdvertencia;
    window.mostrarInfo = mostrarInfo;
    window.mostrarCargando = mostrarCargando;
    
    console.log('✅ Sistema de notificaciones configurables inicializado');
});
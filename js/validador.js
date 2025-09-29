// validador.js - Sistema de validación totalmente configurable

class SistemaValidacion {
    constructor() {
        this.config = null;
        this.validacionesPersonalizadas = {};
        this.inicializar();
    }

    inicializar() {
        if (typeof CONFIGURACION_SISTEMA !== 'undefined') {
            this.config = CONFIGURACION_SISTEMA.validaciones;
            console.log('✅ SistemaValidacion inicializado con configuración');
        } else {
            console.error('❌ CONFIGURACION_SISTEMA no encontrada para validaciones');
            this.configurarValidacionesPorDefecto();
        }
    }

    // Configuración por defecto si no hay configuración
    configurarValidacionesPorDefecto() {
        this.config = {
            globales: {
                requerido: { mensaje: "Este campo es requerido" },
                email: { 
                    patron: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
                    mensaje: "Ingrese un email válido" 
                },
                numero: { min: 0, mensaje: "Debe ser un número válido" }
            },
            porModulo: {}
        };
    }

    // Validar un campo individual
    validarCampo(valor, campo, modulo = null) {
        const errores = [];

        // Obtener configuración del campo
        const configCampo = this.obtenerConfiguracionCampo(campo, modulo);
        
        // Validación de campo requerido
        if (campo.required && this.estaVacio(valor)) {
            errores.push(this.obtenerMensajeError('requerido', configCampo));
        }

        // Si está vacío y no es requerido, no validar más
        if (this.estaVacio(valor) && !campo.required) {
            return { valido: true, errores: [] };
        }

        // Validaciones por tipo de campo
        switch (campo.type) {
            case 'email':
                if (!this.validarEmail(valor)) {
                    errores.push(this.obtenerMensajeError('email', configCampo));
                }
                break;

            case 'tel':
                if (!this.validarTelefono(valor)) {
                    errores.push(this.obtenerMensajeError('telefono', configCampo));
                }
                break;

            case 'number':
                if (!this.validarNumero(valor, campo)) {
                    errores.push(this.obtenerMensajeError('numero', configCampo));
                }
                break;

            case 'text':
            case 'textarea':
                const errorTexto = this.validarTexto(valor, campo, configCampo);
                if (errorTexto) errores.push(errorTexto);
                break;

            case 'password':
                const errorPassword = this.validarPassword(valor, modulo, configCampo);
                if (errorPassword) errores.push(errorPassword);
                break;
        }

        // Validaciones específicas por campo y módulo
        if (modulo && campo.name) {
            const errorEspecifico = this.validarCampoEspecifico(valor, campo.name, modulo);
            if (errorEspecifico) errores.push(errorEspecifico);
        }

        // Validaciones personalizadas
        if (campo.validacion && this.validacionesPersonalizadas[campo.validacion]) {
            const errorPersonalizado = this.validacionesPersonalizadas[campo.validacion](valor, campo);
            if (errorPersonalizado) errores.push(errorPersonalizado);
        }

        return {
            valido: errores.length === 0,
            errores: errores
        };
    }

    // Validar formulario completo
    validarFormulario(formData, modulo) {
        const errores = {};
        let formularioValido = true;

        // Obtener configuración de campos del módulo
        const camposConfig = this.obtenerCamposModulo(modulo);

        camposConfig.forEach(campo => {
            const valor = formData[campo.name];
            const resultado = this.validarCampo(valor, campo, modulo);

            if (!resultado.valido) {
                errores[campo.name] = resultado.errores;
                formularioValido = false;
            }
        });

        return {
            valido: formularioValido,
            errores: errores
        };
    }

    // Validaciones específicas por tipo
    validarEmail(email) {
        const patron = this.config.globales.email?.patron || /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return patron.test(email);
    }

    validarTelefono(telefono) {
        const patron = this.config.globales.telefono?.patron || /^\+?[0-9\s\-\(\)]+$/;
        return patron.test(telefono);
    }

    validarRUT(rut) {
        const patron = this.config.globales.rut?.patron || /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/;
        return patron.test(rut);
    }

    validarNumero(valor, campo) {
        const numero = parseFloat(valor);
        
        if (isNaN(numero)) return false;
        
        if (campo.min !== undefined && numero < parseFloat(campo.min)) return false;
        if (campo.max !== undefined && numero > parseFloat(campo.max)) return false;
        
        return true;
    }

    validarTexto(valor, campo, configCampo) {
        const texto = String(valor);
        
        // Validar longitud mínima
        const minLength = configCampo?.minLength || campo.minLength || 
                         this.config.globales.texto?.minLength;
        if (minLength && texto.length < minLength) {
            return `Debe tener al menos ${minLength} caracteres`;
        }

        // Validar longitud máxima
        const maxLength = configCampo?.maxLength || campo.maxLength || 
                         this.config.globales.texto?.maxLength;
        if (maxLength && texto.length > maxLength) {
            return `No puede exceder ${maxLength} caracteres`;
        }

        // Validar patrón específico
        if (configCampo?.patron && !configCampo.patron.test(texto)) {
            return configCampo.mensaje || 'Formato inválido';
        }

        return null;
    }

    validarPassword(valor, modulo, configCampo) {
        const config = this.config.porModulo[modulo]?.password || {};
        
        if (config.minLength && valor.length < config.minLength) {
            return config.mensaje || `La contraseña debe tener al menos ${config.minLength} caracteres`;
        }

        if (config.requiereMayuscula && !/[A-Z]/.test(valor)) {
            return 'La contraseña debe contener al menos una letra mayúscula';
        }

        if (config.requiereMinuscula && !/[a-z]/.test(valor)) {
            return 'La contraseña debe contener al menos una letra minúscula';
        }

        if (config.requiereNumero && !/\d/.test(valor)) {
            return 'La contraseña debe contener al menos un número';
        }

        if (config.requiereEspecial && !/[!@#$%^&*(),.?":{}|<>]/.test(valor)) {
            return 'La contraseña debe contener al menos un carácter especial';
        }

        return null;
    }

    validarCampoEspecifico(valor, nombreCampo, modulo) {
        const configModulo = this.config.porModulo[modulo];
        if (!configModulo) return null;

        const configCampo = configModulo[nombreCampo];
        if (!configCampo) return null;

        // Validaciones específicas por campo
        switch (nombreCampo) {
            case 'sku':
                if (modulo === 'productos' && configCampo.patron && !configCampo.patron.test(valor)) {
                    return configCampo.mensaje || 'SKU debe ser alfanumérico en mayúsculas';
                }
                break;

            case 'precio':
            case 'precio_compra':
            case 'precio_venta':
                const precio = parseFloat(valor);
                if (configCampo.min && precio < configCampo.min) {
                    return configCampo.mensaje || `El precio debe ser mayor a ${configCampo.min}`;
                }
                break;

            case 'username':
                if (configCampo.patron && !configCampo.patron.test(valor)) {
                    return configCampo.mensaje || 'Usuario debe ser alfanumérico';
                }
                break;

            case 'rut':
                if (!this.validarRUT(valor)) {
                    return this.config.globales.rut?.mensaje || 'Formato de RUT inválido';
                }
                break;
        }

        return null;
    }

    // Utilidades
    estaVacio(valor) {
        return valor === null || valor === undefined || 
               (typeof valor === 'string' && valor.trim() === '') ||
               (Array.isArray(valor) && valor.length === 0);
    }

    obtenerConfiguracionCampo(campo, modulo) {
        if (modulo && this.config.porModulo[modulo] && this.config.porModulo[modulo][campo.name]) {
            return this.config.porModulo[modulo][campo.name];
        }
        return {};
    }

    obtenerMensajeError(tipoValidacion, configCampo) {
        return configCampo.mensaje || 
               this.config.globales[tipoValidacion]?.mensaje || 
               'Valor inválido';
    }

    obtenerCamposModulo(modulo) {
        if (window.configManager) {
            return window.configManager.getCamposConfig(modulo);
        } else if (window.CONFIGURACION_SISTEMA?.modulos[modulo]) {
            return window.CONFIGURACION_SISTEMA.modulos[modulo].columnasFormulario || [];
        }
        return [];
    }

    // Agregar validación personalizada
    agregarValidacionPersonalizada(nombre, funcion) {
        this.validacionesPersonalizadas[nombre] = funcion;
        console.log(`✅ Validación personalizada '${nombre}' agregada`);
    }

    // Validar en tiempo real (para campos)
    validarTiempoReal(elemento, modulo) {
        const campo = this.obtenerConfiguracionCampoElemento(elemento, modulo);
        if (!campo) return;

        const resultado = this.validarCampo(elemento.value, campo, modulo);
        this.mostrarResultadoValidacion(elemento, resultado);

        return resultado.valido;
    }

    // Obtener configuración de campo desde elemento DOM
    obtenerConfiguracionCampoElemento(elemento, modulo) {
        const nombreCampo = elemento.name || elemento.id;
        const camposModulo = this.obtenerCamposModulo(modulo);
        
        return camposModulo.find(campo => campo.name === nombreCampo);
    }

    // Mostrar resultado de validación en el DOM
    mostrarResultadoValidacion(elemento, resultado) {
        const contenedor = elemento.closest('.mb-3') || elemento.parentElement;
        
        // Remover mensajes de error anteriores
        const erroresAnteriores = contenedor.querySelectorAll('.invalid-feedback, .text-danger');
        erroresAnteriores.forEach(error => error.remove());

        // Remover clases de estado anterior
        elemento.classList.remove('is-valid', 'is-invalid');

        if (resultado.valido) {
            elemento.classList.add('is-valid');
        } else {
            elemento.classList.add('is-invalid');
            
            // Mostrar primer error
            if (resultado.errores.length > 0) {
                const mensajeError = document.createElement('div');
                mensajeError.className = 'invalid-feedback d-block';
                mensajeError.textContent = resultado.errores[0];
                contenedor.appendChild(mensajeError);
            }
        }
    }

    // Configurar validación automática en formularios
    configurarValidacionAutomatica(formularioId, modulo) {
        const formulario = document.getElementById(formularioId);
        if (!formulario) return;

        const campos = formulario.querySelectorAll('input, textarea, select');
        
        campos.forEach(campo => {
            // Validación en tiempo real
            campo.addEventListener('blur', () => {
                this.validarTiempoReal(campo, modulo);
            });

            // Validación mientras escribe (con debounce)
            if (campo.type === 'text' || campo.type === 'email' || campo.tagName === 'TEXTAREA') {
                let timeout;
                campo.addEventListener('input', () => {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        this.validarTiempoReal(campo, modulo);
                    }, 500);
                });
            }
        });

        console.log(`✅ Validación automática configurada para formulario: ${formularioId}`);
    }

    // Validar y mostrar errores en formulario completo
    validarYMostrarErrores(formularioId, formData, modulo) {
        const resultado = this.validarFormulario(formData, modulo);
        
        if (!resultado.valido) {
            // Mostrar errores en cada campo
            Object.keys(resultado.errores).forEach(nombreCampo => {
                const elemento = document.querySelector(`#${formularioId} [name="${nombreCampo}"]`);
                if (elemento) {
                    this.mostrarResultadoValidacion(elemento, {
                        valido: false,
                        errores: resultado.errores[nombreCampo]
                    });
                }
            });

            // Hacer scroll al primer error
            const primerError = document.querySelector(`#${formularioId} .is-invalid`);
            if (primerError) {
                primerError.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                primerError.focus();
            }
        }

        return resultado;
    }
}

// Funciones globales de conveniencia
function validarCampo(valor, campo, modulo = null) {
    return window.sistemaValidacion ? 
        window.sistemaValidacion.validarCampo(valor, campo, modulo) : 
        { valido: true, errores: [] };
}

function validarFormulario(formData, modulo) {
    return window.sistemaValidacion ? 
        window.sistemaValidacion.validarFormulario(formData, modulo) : 
        { valido: true, errores: {} };
}

function configurarValidacionFormulario(formularioId, modulo) {
    if (window.sistemaValidacion) {
        window.sistemaValidacion.configurarValidacionAutomatica(formularioId, modulo);
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', function() {
    window.sistemaValidacion = new SistemaValidacion();
    
    // Hacer funciones disponibles globalmente
    window.validarCampo = validarCampo;
    window.validarFormulario = validarFormulario;
    window.configurarValidacionFormulario = configurarValidacionFormulario;
    
    console.log('✅ Sistema de validación configurable inicializado');
});
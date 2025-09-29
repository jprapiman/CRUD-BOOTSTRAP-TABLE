// modales.js - Sistema de modales totalmente configurable

class ModalManager {
    constructor(apiClient, tableManager) {
        this.api = apiClient;
        this.tableManager = tableManager;
        this.modalElement = $('#modalGenerico');
        this.currentModulo = null;
        this.currentId = null;
        
        console.log('✅ ModalManager usando nueva estructura de ConfigManager');
    }

    // Obtener configuración de campos usando la nueva estructura
    getCamposConfig(modulo) {
        if (window.configManager) {
            return window.configManager.getCamposConfig(modulo);
        } else if (window.ConfigUtil) {
            // Fallback usando ConfigUtil
            return window.ConfigUtil.getCamposFormulario(modulo);
        } else {
            console.error('❌ No hay ConfigManager ni ConfigUtil disponible');
            return [];
        }
    }

    // Obtener nombre legible del módulo
    getNombreModulo(modulo) {
        if (window.configManager) {
            return window.configManager.getNombreModulo(modulo);
        } else if (window.ConfigUtil) {
            return window.ConfigUtil.getNombreSingular(modulo);
        } else {
            // Fallback básico
            const nombres = {
                categorias: 'Categoría',
                productos: 'Producto',
                usuarios: 'Usuario',
                proveedores: 'Proveedor',
                bodegas: 'Bodega',
                cajas: 'Caja',
                estados: 'Estado',
                tipos_documento: 'Tipo de Documento',
                tipos_promocion: 'Tipo de Promoción',
                metodos_pago: 'Método de Pago'
            };
            return nombres[modulo] || modulo;
        }
    }

    // Obtener título de formulario
    getTituloFormulario(modulo, esEdicion = false, id = null) {
        if (window.configManager) {
            return window.configManager.getTituloFormulario(modulo, esEdicion, id);
        } else if (window.ConfigUtil) {
            return window.ConfigUtil.getTituloFormulario(modulo, esEdicion, id);
        } else {
            const nombre = this.getNombreModulo(modulo);
            if (esEdicion) {
                return `Editar ${nombre}${id ? ` #${id}` : ''}`;
            } else {
                return `Nuevo ${nombre}`;
            }
        }
    }

    // Abrir modal para crear nuevo registro
    async abrirModalCrear(modulo) {
        this.currentModulo = modulo;
        this.currentId = null;
        
        console.log('🆕 Abriendo modal crear para módulo:', modulo);
        
        try {
            const titulo = this.getTituloFormulario(modulo, false);
            const camposConfig = this.getCamposConfig(modulo);
            
            if (!camposConfig || camposConfig.length === 0) {
                throw new Error(`No hay configuración de campos para el módulo: ${modulo}`);
            }
            
            console.log('📋 Campos config encontrados:', camposConfig.length, 'campos');
            
            await this.cargarDatosDependientes(modulo, camposConfig);
            const formularioHTML = this.generarFormulario(camposConfig);
            
            this.mostrarModal(titulo, formularioHTML);
            this.configurarEventosGuardar();
            
        } catch (error) {
            console.error('❌ Error abriendo modal crear:', error);
            mostrarNotificacion('Error al abrir formulario: ' + error.message, 'error');
        }
    }

    // Abrir modal para editar registro existente
    async abrirModalEditar(modulo, id) {
        this.currentModulo = modulo;
        this.currentId = id;
        
        console.log('✏️ Abriendo modal editar para módulo:', modulo, 'ID:', id);
        
        try {
            const respuesta = await this.api.listar(modulo, 1, 1000);
            const registro = respuesta.data.find(item => item.id == id);
            
            if (!registro) {
                throw new Error('Registro no encontrado');
            }
            
            const titulo = this.getTituloFormulario(modulo, true, id);
            const camposConfig = this.getCamposConfig(modulo);
            
            if (!camposConfig || camposConfig.length === 0) {
                throw new Error(`No hay configuración de campos para el módulo: ${modulo}`);
            }
            
            await this.cargarDatosDependientes(modulo, camposConfig);
            const formularioHTML = this.generarFormulario(camposConfig, registro);
            
            this.mostrarModal(titulo, formularioHTML);
            this.configurarEventosGuardar();
            
        } catch (error) {
            console.error('❌ Error al cargar datos para edición:', error);
            mostrarNotificacion('Error al cargar datos del registro: ' + error.message, 'error');
        }
    }

    // Cargar datos para selects dependientes
    async cargarDatosDependientes(modulo, camposConfig) {
        console.log('🔄 Cargando datos dependientes para:', modulo);
        
        for (let campo of camposConfig) {
            try {
                if (campo.type === 'select' && campo.name === 'categoria_padre_id') {
                    const respuesta = await this.api.listar('categorias', 1, 100);
                    campo.options = respuesta.data.map(cat => ({
                        value: cat.id,
                        text: cat.nombre
                    }));
                    console.log('📂 Categorías padre cargadas:', campo.options.length);
                    
                } else if (campo.type === 'select-multiple' && campo.name === 'categoria_ids') {
                    const respuesta = await this.api.listar('categorias', 1, 100);
                    campo.options = respuesta.data.map(cat => ({
                        value: cat.id,
                        text: cat.nombre
                    }));
                    console.log('📂 Categorías múltiples cargadas:', campo.options.length);
                    
                } else if (campo.type === 'select' && campo.name === 'bodega_id') {
                    const respuesta = await this.api.listar('bodegas', 1, 100);
                    campo.options = respuesta.data.map(bod => ({
                        value: bod.id,
                        text: bod.nombre
                    }));
                    console.log('🏪 Bodegas cargadas:', campo.options.length);
                }
            } catch (error) {
                console.warn('⚠️ Error cargando datos para campo:', campo.name, error);
            }
        }
    }

    // Generar HTML del formulario
    generarFormulario(camposConfig, datos = null) {
        console.log('🏗️ Generando formulario con', camposConfig.length, 'campos');
        
        let html = '<form id="formModal">';
        camposConfig.forEach(campo => {
            html += this.generarCampo(campo, datos);
        });
        html += '</form>';
        return html;
    }

    // Generar HTML para cada tipo de campo
    // En modales.js, mejora el método generarCampo:
	generarCampo(campo, datos) {
		const valor = datos ? datos[campo.name] : '';
		const requiredAttr = campo.required ? 'required' : '';
		const readonlyAttr = campo.readonly ? 'readonly' : '';
		const requiredClass = campo.required ? 'required' : '';
		
		let html = `<div class="mb-3">`;
		html += `<label for="${campo.name}" class="form-label ${requiredClass}">${campo.label}</label>`;
		
		switch (campo.type) {
			case 'text':
			case 'email':
			case 'tel':
			case 'password':
			case 'number':
				html += `<input type="${campo.type}" class="form-control" id="${campo.name}" name="${campo.name}" 
						 value="${valor || ''}" ${requiredAttr} ${readonlyAttr}
						 placeholder="${campo.placeholder || ''}"
						 ${campo.min ? `min="${campo.min}"` : ''} ${campo.step ? `step="${campo.step}"` : ''}>`;
				break;
				
			case 'textarea':
				html += `<textarea class="form-control" id="${campo.name}" name="${campo.name}" 
						 rows="4" ${requiredAttr} ${readonlyAttr} placeholder="${campo.placeholder || ''}">${valor || ''}</textarea>`;
				break;
				
			case 'select':
				html += `<select class="form-select" id="${campo.name}" name="${campo.name}" ${requiredAttr} ${readonlyAttr}>`;
				html += `<option value="">Seleccione...</option>`;
				(campo.options || []).forEach(opt => {
					const selected = valor == opt.value ? 'selected' : '';
					html += `<option value="${opt.value}" ${selected}>${opt.text}</option>`;
				});
				html += `</select>`;
				break;
				
			case 'select-multiple':
				html += `<select class="form-select" id="${campo.name}" name="${campo.name}" multiple ${requiredAttr}>`;
				(campo.options || []).forEach(opt => {
					const selected = datos && datos.categorias && datos.categorias.includes(opt.text) ? 'selected' : '';
					html += `<option value="${opt.value}" ${selected}>${opt.text}</option>`;
				});
				html += `</select>`;
				html += `<div class="form-text">Mantén presionada la tecla Ctrl para seleccionar múltiples opciones</div>`;
				break;
				
			case 'checkbox':
				const checked = datos ? (valor ? 'checked' : '') : (campo.checked ? 'checked' : '');
				html += `<div class="form-check">`;
				html += `<input class="form-check-input" type="checkbox" id="${campo.name}" name="${campo.name}" ${checked}>`;
				html += `<label class="form-check-label" for="${campo.name}">${campo.label}</label>`;
				html += `</div>`;
				break;
		}
		
		if (campo.placeholder && campo.type !== 'checkbox') {
			html += `<div class="form-text">${campo.placeholder}</div>`;
		}
		
		html += `</div>`;
		return html;
	}

    // Mostrar el modal con el contenido
    mostrarModal(titulo, contenido) {
        console.log('🎯 Mostrando modal:', titulo);
        
        $('#modalGenericoTitle').text(titulo);
        $('#modalGenericoBody').html(contenido);
        $('#modalGenericoGuardar').text(this.currentId ? 'Actualizar' : 'Guardar');
        this.modalElement.modal('show');
        
        console.log('✅ Modal mostrado correctamente');
    }

    // Configurar eventos del botón guardar
    configurarEventosGuardar() {
        $('#modalGenericoGuardar').off('click').on('click', () => {
            this.guardarRegistro();
        });
        
        $('#formModal').off('submit').on('submit', (e) => {
            e.preventDefault();
            this.guardarRegistro();
        });
    }

    // Guardar o actualizar registro
	// En la clase ModalManager, mejora guardarRegistro:
	// En el método guardarRegistro, mejora la parte del loading:
	async guardarRegistro() {
		const formData = this.obtenerDatosFormulario();
		
		console.log('💾 Operación:', this.currentId ? 'ACTUALIZAR' : 'CREAR');
		
		if (!this.validarFormulario(formData)) {
			return;
		}
		
		const botonGuardar = $('#modalGenericoGuardar');
		const textoOriginal = botonGuardar.html();
		
		try {
			// Mostrar loading con estilo mejorado
			botonGuardar.html(`
				<i class="fas fa-spinner fa-spin me-1"></i>
				${this.currentId ? 'Actualizando...' : 'Guardando...'}
			`).prop('disabled', true).addClass('btn-loading');
			
			let resultado;
			if (this.currentId) {
				resultado = await this.api.actualizar(this.currentModulo, this.currentId, formData);
				mostrarNotificacion('Registro actualizado correctamente', 'success');
			} else {
				resultado = await this.api.crear(this.currentModulo, formData);
				mostrarNotificacion('Registro creado correctamente', 'success');
			}
			
			this.modalElement.modal('hide');
			this.tableManager.refrescarTablaActual();
			
		} catch (error) {
			console.error('❌ Error guardando registro:', error);
			// ... manejo de errores existente
		} finally {
			// Restaurar botón con mejor estilo
			botonGuardar.html(`
				<i class="${this.currentId ? 'fas fa-save' : 'fas fa-plus'} me-1"></i>
				${this.currentId ? 'Actualizar' : 'Guardar'}
			`).prop('disabled', false).removeClass('btn-loading');
		}
	}

    // Obtener datos del formulario
    // En la clase ModalManager, mejora el método obtenerDatosFormulario:
	obtenerDatosFormulario() {
		const formData = {};
		const camposConfig = this.getCamposConfig(this.currentModulo);
		
		console.log('📋 Procesando campos para:', this.currentModulo, this.currentId ? 'ACTUALIZACIÓN' : 'CREACIÓN');
		
		camposConfig.forEach(campo => {
			// EXCLUIR CAMPOS PROBLEMÁTICOS SEGÚN MÓDULO Y OPERACIÓN
			const excluir = this.debeExcluirCampo(campo.name, this.currentModulo, this.currentId);
			if (excluir) {
				console.log(`🚫 Excluyendo campo: ${campo.name} - ${excluir}`);
				return;
			}
			
			const element = $(`#${campo.name}`);
			
			if (element.length === 0) {
				console.warn('⚠️ Elemento no encontrado:', campo.name);
				return;
			}
			
			if (campo.type === 'checkbox') {
				formData[campo.name] = element.is(':checked');
			} else if (campo.type === 'select-multiple') {
				formData[campo.name] = element.val() ? element.val().join(',') : '';
			} else {
				formData[campo.name] = element.val();
			}
		});
		
		console.log('📤 FormData final:', formData);
		return formData;
	}

	// Nuevo método para determinar qué campos excluir
	debeExcluirCampo(nombreCampo, modulo, esEdicion) {
		const exclusiones = {
			// Para todos los módulos en actualización
			'*': {
				actualizacion: ['created_at', 'updated_at', 'password'] // Campos que nunca se deben actualizar
			},
			// Exclusiones específicas por módulo
			'productos': {
				creacion: [],
				actualizacion: ['categoria_ids', 'stock_actual', 'stock_minimo']
			},
			'usuarios': {
				creacion: [],
				actualizacion: ['password'] // No actualizar password a menos que se cambie explícitamente
			},
			'tipos_documento': {
				creacion: [],
				actualizacion: ['correlativo_actual'] // No permitir modificar el correlativo en actualización
			},
			'tipos_promocion': {
				creacion: [],
				actualizacion: []
			},
			'metodos_pago': {
				creacion: [],
				actualizacion: []
			}
		};
		
		// Verificar exclusiones globales
		if (esEdicion && exclusiones['*'].actualizacion.includes(nombreCampo)) {
			return 'Exclusión global para actualización';
		}
		
		// Verificar exclusiones específicas del módulo
		if (exclusiones[modulo]) {
			if (esEdicion && exclusiones[modulo].actualizacion.includes(nombreCampo)) {
				return `Exclusión específica para actualización en ${modulo}`;
			}
			if (!esEdicion && exclusiones[modulo].creacion.includes(nombreCampo)) {
				return `Exclusión específica para creación en ${modulo}`;
			}
		}
		
		return false;
	}

    // Validar formulario
    validarFormulario(formData) {
        const camposConfig = this.getCamposConfig(this.currentModulo);
        
        for (let campo of camposConfig) {
            if (campo.required && (!formData[campo.name] || formData[campo.name] === '')) {
                mostrarNotificacion(`El campo "${campo.label}" es requerido`, 'warning');
                $(`#${campo.name}`).focus();
                return false;
            }
        }
        
        return true;
    }
}

// Instancia global del modal manager
let modalManager;

// FUNCIONES GLOBALES
function abrirModal(modulo) {
    console.log('🆕 abrirModal global llamado con:', modulo);
    if (modalManager) {
        console.log('✅ ModalManager disponible');
        modalManager.abrirModalCrear(modulo);
    } else {
        console.error('❌ ModalManager NO está definido');
        mostrarNotificacion('Error: Sistema de modales no disponible', 'error');
    }
}

function editar(modulo, id) {
    console.log('✏️ editar global llamado con:', modulo, id);
    if (modalManager) {
        modalManager.abrirModalEditar(modulo, id);
    } else {
        console.error('❌ ModalManager no disponible para editar');
        mostrarNotificacion('Error: Sistema de modales no disponible', 'error');
    }
}

async function eliminar(modulo, id) {
    const nombreModulo = modalManager ? modalManager.getNombreModulo(modulo) : modulo;
    
    if (confirm(`¿Está seguro de eliminar este ${nombreModulo.toLowerCase()}?`)) {
        try {
            await window.api.eliminar(modulo, id);
            mostrarNotificacion(`${nombreModulo} eliminado correctamente`, 'success');
            window.tableManager.refrescarTablaActual();
        } catch (error) {
            console.error('❌ Error eliminando registro:', error);
            mostrarNotificacion('Error al eliminar el registro: ' + error.message, 'error');
        }
    }
}

// Inicialización
$(document).ready(() => {
    console.log('🔄 Inicializando ModalManager con nueva estructura...');
    
    // Esperar a que ConfigManager esté disponible
    const inicializarModal = () => {
        if (window.api && window.tableManager) {
            modalManager = new ModalManager(window.api, window.tableManager);
            window.modalManager = modalManager;
            
            // Hacer funciones globales
            window.abrirModal = abrirModal;
            window.editar = editar;
            window.eliminar = eliminar;
            
            console.log('✅ ModalManager inicializado con nueva estructura');
            return true;
        } else {
            console.log('⏳ Esperando API y TableManager...');
            return false;
        }
    };

    // Intentar inicializar, si falla, reintentar
    if (!inicializarModal()) {
        setTimeout(() => {
            if (!inicializarModal()) {
                console.error('❌ No se pudo inicializar ModalManager después de reintentos');
            }
        }, 1000);
    }
});
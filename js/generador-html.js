// generador-html.js - Generador dinámico totalmente configurable

class GeneradorHTML {
    constructor() {
        this.config = null;
        this.inicializar();
    }

    inicializar() {
        if (typeof CONFIGURACION_SISTEMA !== 'undefined') {
            this.config = CONFIGURACION_SISTEMA;
            console.log('✅ GeneradorHTML inicializado con configuración completa');
        } else {
            console.error('❌ CONFIGURACION_SISTEMA no encontrada');
        }
    }

    // ===== GENERADORES DE ESTRUCTURA PRINCIPAL =====
	
	// Navbar mejorado con menú responsive
	generarNavbar() {
		const branding = this.config.branding;
		const navegacion = this.config.navegacion;

		return `
			<nav class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top shadow-sm">
				<div class="container-fluid">
					<a class="navbar-brand fw-bold" href="#">
						<i class="${branding.logo} me-2"></i>
						${branding.nombre}
					</a>
					
					<button class="navbar-toggler d-lg-none" type="button" onclick="toggleSidebar()">
						<span class="navbar-toggler-icon"></span>
					</button>
					
					<div class="collapse navbar-collapse">
						<ul class="navbar-nav ms-auto">
							${navegacion.menuPrincipal.map(item => `
								<li class="nav-item">
									<a class="nav-link" href="${item.url}">
										<i class="${item.icono}"></i>
										${item.nombre}
									</a>
								</li>
							`).join('')}
						</ul>
					</div>
				</div>
			</nav>
		`;
	}

    // Generar menú de usuario
    generarMenuUsuario() {
        const navegacion = this.config.navegacion;
        const usuario = navegacion.usuarioDefecto;
        const menu = navegacion.menuUsuario || [];

        return `
            <ul class="navbar-nav ms-auto">
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                        <i class="${usuario.avatar}"></i>
                        ${usuario.nombre}
                    </a>
                    <ul class="dropdown-menu">
                        ${menu.map(item => {
                            if (item.separador) {
                                return '<li><hr class="dropdown-divider"></li>';
                            }
                            return `
                                <li>
                                    <a class="dropdown-item ${item.clase || ''}" href="${item.url || '#'}" 
                                       ${item.accion ? `onclick="${item.accion}()"` : ''}>
                                        <i class="${item.icono}"></i>
                                        ${item.nombre}
                                    </a>
                                </li>
                            `;
                        }).join('')}
                    </ul>
                </li>
            </ul>
        `;
    }

    // Generar título principal configurable
    generarTituloPrincipal() {
        const branding = this.config.branding;
        const textos = this.config.textos.titulos;

        return `
            <div class="row mb-4">
                <div class="col-12">
                    <h1 class="display-6">
                        <i class="fas fa-tachometer-alt text-primary"></i>
                        ${textos.panelAdmin}
                    </h1>
                    <p class="lead text-muted">${branding.slogan}</p>
                </div>
            </div>
        `;
    }

    // Generar todas las pestañas usando configuración
    // En generarPestanas, mejorar para usar configuración:
	generarPestanas() {
		if (!this.config || !this.config.modulos) {
			console.error('❌ No hay configuración de módulos disponible');
			return '';
		}

		// USAR ORDEN CONFIGURADO SI EXISTE
		let modulos;
		if (this.config.mapeos && this.config.mapeos.ordenPestanas) {
			modulos = this.config.mapeos.ordenPestanas;
		} else {
			modulos = Object.keys(this.config.modulos);
		}

		let pestanasHTML = '';
		
		modulos.forEach((modulo, index) => {
			const moduloConfig = this.config.modulos[modulo];
			if (!moduloConfig) {
				console.warn(`⚠️ Configuración no encontrada para módulo: ${modulo}`);
				return;
			}
			
			const activeClass = index === 0 ? 'active' : '';
			const tabId = this.convertirModuloATabId(modulo);
			
			pestanasHTML += `
				<li class="nav-item" role="presentation">
					<button class="nav-link ${activeClass}" 
							id="${tabId}-tab" 
							data-bs-toggle="tab" 
							data-bs-target="#${tabId}" 
							type="button" 
							role="tab" 
							aria-controls="${tabId}" 
							aria-selected="${index === 0 ? 'true' : 'false'}"
							onclick="window.manejarCambioPestana('${tabId}')">
						<i class="${moduloConfig.icono || 'fas fa-cube'}"></i>
						${moduloConfig.plural}
					</button>
				</li>
			`;
		});

		return pestanasHTML;
	}

    // Generar contenido de todas las pestañas usando configuración
    generarContenidoPestanas() {
		if (!this.config || !this.config.modulos) {
			return '';
		}

		// USAR ORDEN DESDE CONFIGURACIÓN
		let modulos;
		if (window.configManager) {
			modulos = window.configManager.getOrdenModulos();
		} else {
			modulos = Object.keys(this.config.modulos);
		}

		let contenidoHTML = '';
		
		modulos.forEach((modulo, index) => {
			const moduloConfig = this.config.modulos[modulo];
			const activeClass = index === 0 ? 'show active' : '';
			const tabId = window.configManager ? 
				window.configManager.getTabIdPorModulo(modulo) : 
				moduloConfig.tabId || modulo;
			
			const tableId = window.configManager ?
				window.configManager.getTableIdPorModulo(modulo) :
				moduloConfig.tableId || `tabla${this.capitalize(modulo)}`;
			const modulos = Object.keys(this.config.modulos);
			const textos = this.config.textos;
			let contenidoHTML = '';
			
			modulos.forEach((modulo, index) => {
				const moduloConfig = this.config.modulos[modulo];
				const activeClass = index === 0 ? 'show active' : '';
				const tabId = this.convertirModuloATabId(modulo);
				const tableId = `tabla${this.capitalize(modulo)}`;
				
				contenidoHTML += `
					<div class="tab-pane fade ${activeClass}" 
						 id="${tabId}" 
						 role="tabpanel" 
						 aria-labelledby="${tabId}-tab">
						
						<!-- Header de la pestaña -->
						<div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
							<div class="mb-3 mb-md-0">
								<h4 class="mb-1 d-flex align-items-center">
									<i class="${moduloConfig.icono || 'fas fa-cube'} text-primary me-2"></i>
									${moduloConfig.plural}
								</h4>
								<p class="text-muted mb-0">${moduloConfig.descripcion || `Gestión completa de ${moduloConfig.plural.toLowerCase()}`}</p>
							</div>
							
							<div class="d-flex gap-2 flex-wrap">
								<button type="button" 
										class="btn btn-primary btn-sm d-flex align-items-center"
										onclick="abrirModal('${modulo}')">
									<i class="${this.config.ui.iconos.crear} me-1"></i>
									${textos.botones.nuevo} ${moduloConfig.singular}
								</button>
								
								<button type="button" 
										class="btn btn-outline-secondary btn-sm d-flex align-items-center"
										onclick="recargarTabla('${tableId}')">
									<i class="fas fa-sync-alt me-1"></i>
									Actualizar
								</button>
							</div>
						</div>

						<!-- Estadísticas rápidas -->
						<div class="row mb-4">
							<div class="col-md-3">
								<div class="card bg-primary text-white">
									<div class="card-body py-3">
										<div class="d-flex align-items-center">
											<div class="flex-grow-1">
												<h6 class="card-title mb-0">Total Registros</h6>
												<small id="contador-${tableId}">Cargando...</small>
											</div>
											<i class="fas fa-database fs-4 opacity-50"></i>
										</div>
									</div>
								</div>
							</div>
						</div>

						<!-- Tabla -->
						<div class="card">
							<div class="card-body p-0">
								<div class="table-responsive" style="max-height: 600px;">
									${this.generarTabla(tableId, modulo, moduloConfig)}
								</div>
							</div>
						</div>
					</div>
				`;
			});
		});

		return contenidoHTML;
	}

    // Generar estructura de tabla usando configuración de tablas
    generarTabla(tableId, modulo, moduloConfig) {
        const tablaConfig = this.config.tablas;
        const descripcion = moduloConfig.descripcion || `Gestión de ${moduloConfig.plural.toLowerCase()}`;
        
        return `
            <table id="${tableId}" 
                   class="${tablaConfig.clases.tabla}"
                   data-toggle="table"
                   data-pagination="${tablaConfig.configuracionGlobal.pagination}"
                   data-search="${tablaConfig.configuracionGlobal.search}"
                   data-show-refresh="${tablaConfig.configuracionGlobal.showRefresh}"
                   data-show-columns="${tablaConfig.configuracionGlobal.showColumns}"
                   data-sort-name="${tablaConfig.configuracionGlobal.sortName}"
                   data-sort-order="${tablaConfig.configuracionGlobal.sortOrder}"
                   data-page-size="${tablaConfig.configuracionGlobal.pageSize}"
                   data-page-list="[${tablaConfig.configuracionGlobal.pageList.join(',')}]">
                <thead class="${tablaConfig.clases.cabecera}">
                    <tr>
                        <!-- Las columnas se generan dinámicamente desde la configuración -->
                    </tr>
                </thead>
                <tbody>
                    <!-- Los datos se cargan dinámicamente vía AJAX -->
                </tbody>
            </table>
            <small class="text-muted">
                <i class="fas fa-info-circle"></i>
                ${descripcion}
            </small>
        `;
    }

    // Generar modal usando configuración
    generarModal() {
		const modal = this.config.modal;
		const textos = this.config.textos;

		return `
			<div class="modal ${modal.animacion}" id="modalGenerico" tabindex="-1" 
				 aria-labelledby="modalGenericoTitle" aria-hidden="true"
				 data-bs-backdrop="${modal.backdrop}"
				 data-bs-keyboard="${modal.keyboard}">
				<div class="modal-dialog ${modal.tamaño} ${modal.centrado ? 'modal-dialog-centered' : ''}">
					<div class="modal-content">
						<div class="modal-header bg-primary text-white">
							<h5 class="modal-title" id="modalGenericoTitle">
								${modal.configuracion.mostrarIconoTitulo ? '<i class="fas fa-edit me-2"></i>' : ''}
								<span class="modal-title-text">Título del Modal</span>
							</h5>
							<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="${textos.botones.cerrar}"></button>
						</div>
						<div class="modal-body" id="modalGenericoBody">
							<!-- Contenido del formulario se genera dinámicamente -->
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
								<i class="${modal.botones.cancelar.icono} me-1"></i>
								${modal.botones.cancelar.texto}
							</button>
							<button type="button" class="btn btn-primary" id="modalGenericoGuardar">
								<i class="${modal.botones.guardar.icono} me-1"></i>
								<span class="btn-text">${modal.botones.guardar.texto}</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		`;
	}

    // Generar footer usando configuración
    generarFooter() {
        const ui = this.config.ui;
        const sistema = this.config.sistema;

        if (!ui.layout.footer.mostrar) return '';

        return `
            <footer class="${ui.layout.footer.fijo ? 'fixed-bottom' : ''} bg-light mt-5 py-3 border-top">
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-md-6">
                            ${ui.layout.footer.mostrarCopyright ? `
                                <p class="text-muted mb-0">
                                    <i class="fas fa-copyright"></i>
                                    ${sistema.año} ${sistema.nombre} - Sistema de gestión integral
                                </p>
                            ` : ''}
                        </div>
                        <div class="col-md-6 text-end">
                            ${ui.layout.footer.mostrarVersion ? `
                                <p class="text-muted mb-0">
                                    <i class="fas fa-code"></i>
                                    v${sistema.version} - Generado dinámicamente desde configuración
                                </p>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }

    // ===== MÉTODOS DE UTILIDAD =====

	// Convertir módulo a tabId
	// En GeneradorHTML, reemplazar:
	convertirModuloATabId(modulo) {
		return window.configManager.getTabIdPorModulo(modulo);
	}

    // Capitalizar nombre de módulo
    capitalize(str) {
        return str.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join('');
    }
	
	// Generar pestañas para sidebar vertical
	generarPestanasVerticales() {
		if (!this.config || !this.config.modulos) {
			return '';
		}

		const modulos = Object.keys(this.config.modulos);
		let pestanasHTML = '';
		
		modulos.forEach((modulo, index) => {
			const moduloConfig = this.config.modulos[modulo];
			const activeClass = index === 0 ? 'active' : '';
			const tabId = this.convertirModuloATabId(modulo);
			
			pestanasHTML += `
				<button class="nav-link text-start ${activeClass} d-flex align-items-center py-3 px-3" 
						id="${tabId}-tab-vertical" 
						data-bs-toggle="pill" 
						data-bs-target="#${tabId}" 
						type="button" 
						role="tab" 
						aria-controls="${tabId}" 
						aria-selected="${index === 0 ? 'true' : 'false'}"
						onclick="manejarCambioPestana('${tabId}')">
					<i class="${moduloConfig.icono || 'fas fa-cube'} me-3 fs-5"></i>
					<div class="d-flex flex-column">
						<span class="fw-semibold">${moduloConfig.plural}</span>
						<small class="text-muted">${moduloConfig.descripcion || 'Gestión del módulo'}</small>
					</div>
				</button>
			`;
		});

		return pestanasHTML;
	}

	generarAplicacionCompleta() {
		return `
			${this.generarNavbar()}
			
			<!-- Contenedor principal con sidebar -->
			<div class="d-flex" id="wrapper">
				<!-- Sidebar -->
				<div class="bg-white border-end" id="sidebar-wrapper">
					<div class="sidebar-heading border-bottom bg-light px-3 py-2">
						<h6 class="mb-0 d-flex align-items-center">
							<i class="fas fa-th-large me-2 text-primary"></i>
							Módulos
						</h6>
					</div>
					<div class="list-group list-group-flush">
						${this.generarMenuLateral()}
					</div>
				</div>
				
				<!-- Contenido principal -->
				<div id="page-content-wrapper">
					<div class="container-fluid p-3">
						<!-- Área de notificaciones -->
						<div id="notificaciones" class="fixed-notifications"></div>
						
						<!-- Contenido dinámico del módulo SIN HEADER -->
						<div id="contenido-modulo">
							<!-- El contenido se carga dinámicamente aquí -->
						</div>
					</div>
				</div>
			</div>
			
			${this.generarFooter()}
		`;
	}
	
	// Generar HTML de error crítico
	generarErrorCriticoHTML(error, scriptsExitosos, scriptsFallidos) {
		return `
			<div class="container mt-5">
				<div class="alert alert-danger" role="alert">
					<h4 class="alert-heading">Error Crítico</h4>
					<p>No se pudo cargar la aplicación completamente.</p>
					<hr>
					<p class="mb-0">
						<strong>Error:</strong> ${error.message}<br>
						<strong>Scripts cargados:</strong> ${scriptsExitosos.join(', ')}<br>
						<strong>Scripts fallidos:</strong> ${scriptsFallidos.map(f => f.src).join(', ')}
					</p>
					<button class="btn btn-outline-danger mt-3" onclick="location.reload()">
						<i class="fas fa-sync"></i> Recargar Página
					</button>
				</div>
			</div>
		`;
	}
	// Generar HTML de notificaciones
	generarNotificacionHTML(notificacion) {
		const textos = CONFIGURACION_SISTEMA?.textos?.botones || { cerrar: 'Cerrar' };
		
		return `
			<div id="notificacion-${notificacion.id}" 
				 class="alert ${notificacion.clase} alert-dismissible fade show mb-2" 
				 role="alert"
				 data-tipo="${notificacion.tipo}">
				
				<div class="d-flex align-items-start">
					<div class="me-2">
						<i class="fas ${notificacion.icono}"></i>
					</div>
					
					<div class="flex-grow-1">
						${notificacion.titulo ? `<strong>${notificacion.titulo}:</strong> ` : ''}
						<span class="notificacion-mensaje">${notificacion.mensaje}</span>
						
						${this.config.notificaciones?.mostrarTimestamp ? `
							<small class="d-block text-muted mt-1">
								${notificacion.timestamp.toLocaleTimeString()}
							</small>
						` : ''}
					</div>
					
					<button type="button" 
							class="btn-close" 
							data-bs-dismiss="alert" 
							aria-label="${textos.cerrar}"
							onclick="sistemaNotificaciones.cerrar('${notificacion.id}')">
					</button>
				</div>
			</div>
		`;
	}

	// Generar HTML de confirmación
	generarConfirmacionHTML(notificacionId, mensaje) {
		const textos = CONFIGURACION_SISTEMA?.textos?.botones || {};
		
		return `
			<div id="notificacion-${notificacionId}" 
				 class="alert alert-warning alert-dismissible fade show mb-2" 
				 role="alert">
				
				<div class="d-flex align-items-center">
					<i class="fas fa-question-circle me-2"></i>
					<span class="flex-grow-1">${mensaje}</span>
					
					<div class="btn-group ms-2" role="group">
						<button type="button" 
								class="btn btn-sm btn-success" 
								onclick="sistemaNotificaciones.confirmar('${notificacionId}', true)">
							<i class="fas fa-check"></i>
							${textos.si || 'Sí'}
						</button>
						<button type="button" 
								class="btn btn-sm btn-secondary" 
								onclick="sistemaNotificaciones.confirmar('${notificacionId}', false)">
							<i class="fas fa-times"></i>
							${textos.no || 'No'}
						</button>
					</div>
				</div>
			</div>
		`;
	}

	// Generar HTML de formulario para modal
	generarFormularioHTML(camposConfig, datos = null) {
		let html = '<form id="formModal">';
		camposConfig.forEach(campo => {
			html += this.generarCampoFormularioHTML(campo, datos);
		});
		html += '</form>';
		return html;
	}

	// Generar HTML de campo individual del formulario
	generarCampoFormularioHTML(campo, datos = null) {
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

	// Generar HTML de tabla Bootstrap
	generarTablaBootstrapHTML(tableId, modulo, moduloConfig) {
		const tablaConfig = this.config.tablas;
		const descripcion = moduloConfig.descripcion || `Gestión de ${moduloConfig.plural.toLowerCase()}`;
		
		return `
			<table id="${tableId}" 
				   class="${tablaConfig.clases.tabla}"
				   data-toggle="table"
				   data-pagination="${tablaConfig.configuracionGlobal.pagination}"
				   data-search="${tablaConfig.configuracionGlobal.search}"
				   data-show-refresh="${tablaConfig.configuracionGlobal.showRefresh}"
				   data-show-columns="${tablaConfig.configuracionGlobal.showColumns}"
				   data-sort-name="${tablaConfig.configuracionGlobal.sortName}"
				   data-sort-order="${tablaConfig.configuracionGlobal.sortOrder}"
				   data-page-size="${tablaConfig.configuracionGlobal.pageSize}"
				   data-page-list="[${tablaConfig.configuracionGlobal.pageList.join(',')}]">
				<thead class="${tablaConfig.clases.cabecera}">
					<tr>
						<!-- Las columnas se generan dinámicamente desde la configuración -->
					</tr>
				</thead>
				<tbody>
					<!-- Los datos se cargan dinámicamente vía AJAX -->
				</tbody>
			</table>
			<small class="text-muted">
				<i class="fas fa-info-circle"></i>
				${descripcion}
			</small>
		`;
	}

	// Generar HTML de tabla simple
	generarTablaSimpleHTML(tableId, modulo, moduloConfig) {
		return `
			<table id="${tableId}" 
				   class="table table-hover mb-0"
				   data-toggle="table"
				   data-pagination="true"
				   data-search="true"
				   data-show-refresh="false"
				   data-show-columns="true"
				   data-page-size="15">
				<thead>
					<tr></tr>
				</thead>
				<tbody></tbody>
			</table>
		`;
	}

	// Generar HTML de contenido de módulo
	generarContenidoModuloHTML(modulo, moduloConfig, tableId) {
		return `
			<div class="d-flex justify-content-between align-items-center mb-3">
				<h4 class="mb-0 d-flex align-items-center">
					<i class="${moduloConfig.icono} me-2 text-primary"></i>
					${moduloConfig.plural}
				</h4>
				<div class="btn-group" role="group">
					<button class="btn btn-primary btn-sm" onclick="abrirModal('${modulo}')">
						<i class="fas fa-plus"></i>
						Nuevo
					</button>
					<button class="btn btn-outline-secondary btn-sm" onclick="recargarTabla('${tableId}')">
						<i class="fas fa-sync-alt"></i>
					</button>
				</div>
			</div>
			
			<div class="card shadow-sm">
				<div class="card-body p-0">
					${this.generarTablaSimpleHTML(tableId, modulo, moduloConfig)}
				</div>
			</div>
		`;
	}

	// Generar menú lateral
	// En generarMenuLateral, cambia el onclick:
	generarMenuLateral() {
		const modulos = Object.keys(this.config.modulos);
		let menuHTML = '';
		
		modulos.forEach((modulo, index) => {
			const moduloConfig = this.config.modulos[modulo];
			const activeClass = index === 0 ? 'active' : '';
			
			menuHTML += `
				<a href="#" class="list-group-item list-group-item-action ${activeClass}" 
				   data-modulo="${modulo}"
				   onclick="cargarModuloMenu('${modulo}'); return false;">
					<i class="${moduloConfig.icono || 'fas fa-cube'} me-2"></i>
					<span>${moduloConfig.plural}</span>
				</a>
			`;
		});
		
		return menuHTML;
	}
	
	// Generar menú vertical de módulos
	generarMenuVertical() {
		if (!this.config || !this.config.modulos) {
			return '';
		}

		const modulos = Object.keys(this.config.modulos);
		let menuHTML = '';
		
		modulos.forEach((modulo, index) => {
			const moduloConfig = this.config.modulos[modulo];
			const activeClass = index === 0 ? 'active' : '';
			const tabId = this.convertirModuloATabId(modulo);
			
			menuHTML += `
				<a href="#" class="list-group-item list-group-item-action d-flex align-items-center ${activeClass}" 
				   onclick="cargarModulo('${modulo}', '${tabId}')"
				   data-modulo="${modulo}"
				   data-tabid="${tabId}">
					<i class="${moduloConfig.icono || 'fas fa-cube'} me-3 text-primary"></i>
					<div class="flex-grow-1">
						<div class="fw-semibold">${moduloConfig.plural}</div>
						<small class="text-muted">${moduloConfig.descripcion || 'Gestión del módulo'}</small>
					</div>
				</a>
			`;
		});

		return menuHTML;
	}

    // Inyectar aplicación completa en el contenedor principal
    inyectarAplicacionCompleta(containerId = 'app-container') {
		const container = document.getElementById(containerId);
		
		if (!container) {
			console.error(`❌ No se encontró el contenedor principal: ${containerId}`);
			return false;
		}

		try {
			// Actualizar título de la página
			document.title = this.config.branding.nombre;
			
			// Generar aplicación completa
			container.innerHTML = this.generarAplicacionCompleta();
			
			// Inyectar modal si no existe
			this.inyectarModalSiNoExiste();
			
			// Aplicar estilos dinámicos
			this.aplicarEstilosDinamicos();
			
			console.log('✅ Aplicación completa inyectada correctamente');
			
			// Disparar evento personalizado
			setTimeout(() => {
				const modulos = Object.keys(this.config.modulos);
				const evento = new CustomEvent('estructuraHTMLGenerada', {
					detail: { 
						modulos: modulos,
						generador: this,
						estructura: 'mejorada'
					}
				});
				document.dispatchEvent(evento);
			}, 100);
			
			return true;
		} catch (error) {
			console.error('❌ Error inyectando aplicación completa:', error);
			return false;
		}
	}

    // Actualizar método de inyección principal para usar aplicación completa
    inyectarEnDOM(containerId = 'contenedor-dinamico') {
        // Si es el contenedor principal, generar aplicación completa
        if (containerId === 'app-container') {
            return this.inyectarAplicacionCompleta(containerId);
        }
        
        // Si no, usar el método original para pestañas y tablas
        const container = document.getElementById(containerId);
        
        if (!container) {
            console.error(`❌ No se encontró el contenedor: ${containerId}`);
            return false;
        }

        try {
            container.innerHTML = this.generarEstructuraCompleta();
            
            this.inyectarModalSiNoExiste();
            this.aplicarEstilosDinamicos();
            
            console.log('✅ Estructura HTML inyectada correctamente');
            
            setTimeout(() => {
                const evento = new CustomEvent('estructuraHTMLGenerada', {
                    detail: { 
                        modulos: Object.keys(this.config.modulos),
                        generador: this 
                    }
                });
                document.dispatchEvent(evento);
            }, 50);
            
            return true;
        } catch (error) {
            console.error('❌ Error inyectando estructura:', error);
            return false;
        }
    }

    // Inyectar modal si no existe
    inyectarModalSiNoExiste() {
        if (!document.getElementById('modalGenerico')) {
            document.body.insertAdjacentHTML('beforeend', this.generarModal());
            console.log('✅ Modal genérico inyectado');
        }
    }

    // Aplicar estilos dinámicos desde configuración
    aplicarEstilosDinamicos() {
        const branding = this.config.branding;
        const style = document.createElement('style');
        
        style.textContent = `
            :root {
                --color-primario: ${branding.colores.primario};
                --color-secundario: ${branding.colores.secundario};
                --color-exito: ${branding.colores.exito};
                --color-peligro: ${branding.colores.peligro};
                --color-advertencia: ${branding.colores.advertencia};
                --color-info: ${branding.colores.info};
            }
            
            .navbar-brand {
                font-weight: 600;
            }
            
            .table-responsive {
                margin-top: 1rem;
            }
            
            .badge {
                font-size: 0.75em;
            }
            
            .tab-pane {
                padding: 1rem 0;
            }
            
            .action-buttons {
                white-space: nowrap;
            }
            
            .table th {
                font-weight: 600;
            }
        `;
        
        document.head.appendChild(style);
        console.log('✅ Estilos dinámicos aplicados');
    }

    // ===== MÉTODOS DE VALIDACIÓN =====

    // Validar configuración completa
    validarConfiguracion() {
        const errores = [];
        
        // Validar secciones principales
        const seccionesRequeridas = ['sistema', 'branding', 'modulos', 'textos', 'ui'];
        seccionesRequeridas.forEach(seccion => {
            if (!this.config[seccion]) {
                errores.push(`Falta sección: ${seccion}`);
            }
        });

        // Validar módulos
        Object.keys(this.config.modulos).forEach(modulo => {
            const moduloConfig = this.config.modulos[modulo];
            
            if (!moduloConfig.singular) errores.push(`${modulo}: falta 'singular'`);
            if (!moduloConfig.plural) errores.push(`${modulo}: falta 'plural'`);
            if (!moduloConfig.columnasTablas || !Array.isArray(moduloConfig.columnasTablas)) {
                errores.push(`${modulo}: 'columnasTablas' inválida`);
            }
        });

        if (errores.length > 0) {
            console.warn('⚠️ Errores de validación:', errores);
            return false;
        }
        
        console.log('✅ Configuración completamente válida');
        return true;
    }
}

// Función de utilidad para inicializar automáticamente
function inicializarGeneradorHTML() {
    // Esperar a que la configuración esté disponible
    if (typeof CONFIGURACION_SISTEMA === 'undefined') {
        console.log('⏳ Esperando CONFIGURACION_SISTEMA...');
        setTimeout(inicializarGeneradorHTML, 100);
        return;
    }

    const generador = new GeneradorHTML();
    
    // Hacer disponible globalmente
    window.generadorHTML = generador;
    
    // Validar antes de generar
    if (!generador.validarConfiguracion()) {
        console.error('❌ No se puede generar HTML debido a errores de validación');
        return;
    }

    console.log('✅ GeneradorHTML inicializado correctamente');
    return generador;
}

// INICIALIZACIÓN INMEDIATA (no esperar DOMContentLoaded)
console.log('🏗️ GeneradorHTML cargado, inicializando inmediatamente...');

// Inicialización inmediata con retry
function intentarInicializar() {
    try {
        if (typeof CONFIGURACION_SISTEMA !== 'undefined') {
            const generador = new GeneradorHTML();
            window.generadorHTML = generador;
            console.log('✅ GeneradorHTML inicializado y disponible globalmente');
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('❌ Error inicializando GeneradorHTML:', error);
        return false;
    }
}

// Intentar inicializar inmediatamente
if (!intentarInicializar()) {
    // Si falla, reintentar cada 50ms hasta 5 segundos máximo
    let intentos = 0;
    const maxIntentos = 100;
    const intervalo = setInterval(() => {
        intentos++;
        if (intentarInicializar() || intentos >= maxIntentos) {
            clearInterval(intervalo);
            if (intentos >= maxIntentos) {
                console.error('❌ GeneradorHTML no pudo inicializarse después de múltiples intentos');
            }
        }
    }, 50);
}

// Exportar para uso manual si es necesario
if (typeof window !== 'undefined') {
    window.GeneradorHTML = GeneradorHTML;
    window.inicializarGeneradorHTML = inicializarGeneradorHTML;
}
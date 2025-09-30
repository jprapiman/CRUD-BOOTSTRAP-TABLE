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
	// ===== GENERADORES DE ESTRUCTURA PRINCIPAL =====

// Navbar mejorado con menú responsive Y menú de usuario
// Navbar mejorado con menú responsive
generarNavbar() {
    const branding = this.config.branding;
    const navegacion = this.config.navegacion;
    const usuario = navegacion.usuarioDefecto;

    return `
        <nav class="navbar navbar-expand-lg navbar-light bg-white fixed-top shadow-sm border-bottom">
            <div class="container-fluid">
                <!-- Brand -->
                <a class="navbar-brand fw-bold d-flex align-items-center" href="#">
                    <i class="${branding.logo} me-2"></i>
                    <span class="d-none d-sm-inline">${branding.nombre}</span>
                    <span class="d-inline d-sm-none">${branding.nombreCorto || 'MM'}</span>
                </a>
                
                <!-- Botón hamburguesa para móvil -->
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" 
                        data-bs-target="#navbarContent" aria-controls="navbarContent" 
                        aria-expanded="false" aria-label="Toggle navigation"
                        onclick="toggleNavbarOverlay()">
                    <span class="navbar-toggler-icon"></span>
                </button>
                
                <!-- Contenido colapsable del navbar -->
                <div class="collapse navbar-collapse" id="navbarContent">
                    <!-- Menú de navegación principal -->
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        ${navegacion.menuPrincipal.map(item => `
                            <li class="nav-item">
                                <a class="nav-link ${item.activo ? 'active' : ''}" href="${item.url}"
                                   onclick="cerrarNavbarMovil()">
                                    <i class="${item.icono} me-1"></i>
                                    ${item.nombre}
                                </a>
                            </li>
                        `).join('')}
                    </ul>
                    
                    <!-- Divider -->
                    <hr class="d-lg-none my-2">
                    
                    <!-- Menú de módulos (SOLO en móvil dentro del navbar) -->
                    <div class="d-lg-none mb-3">
                        <h6 class="text-muted mb-2 px-3">
                            <i class="bi bi-grid-3x3-gap-fill me-2"></i>Módulos
                        </h6>
                        ${this.generarMenuLateralParaNavbar()}
                    </div>
                    
                    <!-- Divider -->
                    <hr class="d-lg-none my-2">
                    
                    <!-- Menú de usuario -->
                    ${this.generarMenuUsuarioResponsive()}
                </div>
            </div>
        </nav>
    `;
}



	// Nuevo método: Generar menú lateral para el navbar (móvil)
	generarMenuLateralParaNavbar() {
		const modulos = Object.keys(this.config.modulos);
		let menuHTML = '<ul class="navbar-nav">';
		
		modulos.forEach((modulo, index) => {
			const moduloConfig = this.config.modulos[modulo];
			const activeClass = index === 0 ? 'active' : '';
			
			menuHTML += `
				<li class="nav-item">
					<a href="#" 
					   class="nav-link ${activeClass}" 
					   data-modulo="${modulo}"
					   onclick="cargarModuloMenu('${modulo}'); 
								document.getElementById('navbarContent').classList.remove('show');
								return false;">
						<i class="${moduloConfig.icono || 'bi bi-box'} me-2"></i>
						${moduloConfig.plural}
					</a>
				</li>
			`;
		});
		
		menuHTML += '</ul>';
		return menuHTML;
	}
		
	generarMenuModulosNavbar() {
		if (!this.config || !this.config.modulos) {
			return '';
		}

		const modulos = Object.keys(this.config.modulos);
		let menuHTML = '';
		
		modulos.forEach((modulo) => {
			const moduloConfig = this.config.modulos[modulo];
			const tabId = this.convertirModuloATabId(modulo);
			
			menuHTML += `
				<li class="nav-item">
					<a class="nav-link text-white" href="#" 
					   onclick="cargarModuloDesdeNavbar('${modulo}'); cerrarNavbarMovil(); return false;">
						<i class="${moduloConfig.icono || 'bi bi-box'} me-1"></i>
						${moduloConfig.plural}
					</a>
				</li>
			`;
		});

		return menuHTML;
	}
	
	// Método auxiliar para el menú de usuario responsive
	generarMenuUsuarioResponsive() {
		const navegacion = this.config.navegacion;
		const usuario = navegacion.usuarioDefecto;
		const menu = navegacion.menuUsuario || [];

		return `
			<ul class="navbar-nav">
				<!-- Menú de usuario en escritorio -->
				<li class="nav-item dropdown d-none d-lg-block">
					<a class="nav-link dropdown-toggle d-flex align-items-center" href="#" 
					   role="button" data-bs-toggle="dropdown" aria-expanded="false">
						<i class="${usuario.avatar} me-2"></i>
						${usuario.nombre}
					</a>
					<ul class="dropdown-menu dropdown-menu-end">
						${menu.map(item => {
							if (item.separador) {
								return '<li><hr class="dropdown-divider"></li>';
							}
							return `
								<li>
									<a class="dropdown-item ${item.clase || ''}" 
									   href="${item.url || '#'}" 
									   ${item.accion ? `onclick="${item.accion}(); return false;"` : ''}>
										<i class="${item.icono} me-2"></i>
										${item.nombre}
									</a>
								</li>
							`;
						}).join('')}
					</ul>
				</li>
				
				<!-- Menú de usuario en móvil (expandido) -->
				<li class="nav-item d-lg-none">
					<div class="px-3 py-2 border-top mt-2">
						<div class="d-flex align-items-center mb-2">
							<i class="${usuario.avatar} me-2 fs-4"></i>
							<strong>${usuario.nombre}</strong>
						</div>
						${menu.map(item => {
							if (item.separador) {
								return '<hr class="my-2">';
							}
							return `
								<a class="d-block py-2 text-decoration-none ${item.clase || ''}" 
								   href="${item.url || '#'}"
								   ${item.accion ? `onclick="${item.accion}(); return false;"` : ''}>
									<i class="${item.icono} me-2"></i>
									${item.nombre}
								</a>
							`;
						}).join('')}
					</div>
				</li>
			</ul>
		`;
	}
	// En generarAplicacionCompleta, actualizar el onclick del sidebar
	// En generarAplicacionCompleta, actualizar el onclick del sidebar
	generarAplicacionCompleta() {
		return `
			${this.generarNavbar()}
			
			<!-- Contenedor principal con sidebar -->
			<div class="d-flex" id="wrapper">
				<!-- Sidebar (solo desktop) -->
				<div class="bg-white border-end d-none d-lg-block" id="sidebar-wrapper">
					<div class="sidebar-heading border-bottom bg-light px-3 py-2">
						<h6 class="mb-0 d-flex align-items-center">
							<i class="bi bi-grid-3x3-gap-fill me-2 text-primary"></i>
							Módulos
						</h6>
					</div>
					<div class="list-group list-group-flush">
						${this.generarMenuLateral()}
					</div>
				</div>
				
				<!-- Contenido principal -->
				<div id="page-content-wrapper" class="w-100">
					<div class="container-fluid p-3">
						<!-- Área de notificaciones -->
						<div id="notificaciones" class="fixed-notifications"></div>
						
						<!-- Contenido dinámico del módulo -->
						<div id="contenido-modulo">
							<div class="text-center py-5">
								<i class="bi bi-speedometer2 display-1 text-primary mb-3"></i>
								<h3>Bienvenido al Sistema</h3>
								<p class="text-muted">Selecciona un módulo del menú para comenzar</p>
							</div>
						</div>
					</div>
				</div>
			</div>
			
			${this.generarFooter()}
			
			<script>
				// Inicializar el menú lateral después de que se cargue el DOM
				document.addEventListener('DOMContentLoaded', function() {
					setTimeout(actualizarMenuLateral, 100);
				});
			</script>
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
						<i class="bi bi-speedometer2 text-primary"></i>
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
						<i class="${moduloConfig.icono || 'bi bi-box'}"></i>
						${moduloConfig.plural}
					</button>
				</li>
			`;
		});

		return pestanasHTML;
	}

    // Generar contenido de todas las pestañas usando configuración
    // En la clase GeneradorHTML, reemplaza el método generarContenidoPestanas
	// En la clase GeneradorHTML, reemplaza el método generarContenidoPestanas
	generarContenidoPestanas() {
		if (!this.config || !this.config.modulos) {
			return '';
		}

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
					
					<!-- Estadísticas compactas (opcional) -->
					<div class="row g-3 mb-3">
						<div class="col-lg-3 col-md-4 col-sm-6">
							<div class="stat-card-mini">
								<div class="stat-content">
									<div class="stat-number" id="contador-${tableId}">0</div>
									<div class="stat-label">Total</div>
								</div>
								<div class="stat-icon">
									<i class="bi bi-database"></i>
								</div>
							</div>
						</div>
						<div class="col-lg-3 col-md-4 col-sm-6">
							<div class="stat-card-mini stat-card-success">
								<div class="stat-content">
									<div class="stat-number" id="activos-${tableId}">0</div>
									<div class="stat-label">Activos</div>
								</div>
								<div class="stat-icon">
									<i class="bi bi-check-circle"></i>
								</div>
							</div>
						</div>
					</div>

					<!-- Tabla con Custom Toolbar -->
					<div class="table-container-integrated">
						<div class="table-responsive">
							${this.generarTablaConToolbar(tableId, modulo, moduloConfig)}
						</div>
					</div>
				</div>
			`;
		});

		return contenidoHTML;
	}
 generarTablaConToolbar(tableId, modulo, moduloConfig) {
    const tablaConfig = this.config.tablas;
    const descripcion = moduloConfig.descripcion || `Gestión de ${moduloConfig.plural.toLowerCase()}`;
    const textos = this.config.textos;
    
    return `
        <!-- Toolbar personalizada -->
        <div id="toolbar-${tableId}" class="custom-toolbar">
            <div class="toolbar-content">
                <!-- Título del módulo -->
                <div class="toolbar-title-section">
                    <h4 class="toolbar-title">
                        <i class="${moduloConfig.icono || 'bi bi-box'} toolbar-icon"></i>
                        ${moduloConfig.plural}
                    </h4>
                    <p class="toolbar-description">${descripcion}</p>
                </div>
            </div>
        </div>
        
        <table id="${tableId}" 
               class="${tablaConfig.clases.tabla}"
               data-toggle="table"
               data-toolbar="#toolbar-${tableId}"
               data-modulo="${modulo}"
               data-pagination="${tablaConfig.configuracionGlobal.pagination}"
               data-search="false"
               data-show-refresh="false"
               data-show-columns="${tablaConfig.configuracionGlobal.showColumns}"
               data-sort-name="${tablaConfig.configuracionGlobal.sortName}"
               data-sort-order="${tablaConfig.configuracionGlobal.sortOrder}"
               data-page-size="${tablaConfig.configuracionGlobal.pageSize}"
               data-page-list="[${tablaConfig.configuracionGlobal.pageList.join(',')}]"
               data-buttons="buttons"
               data-buttons-prefix="btn">
            <thead class="${tablaConfig.clases.cabecera}">
                <tr>
                    <!-- Las columnas se generan dinámicamente desde la configuración -->
                </tr>
            </thead>
            <tbody>
                <!-- Los datos se cargan dinámicamente vía AJAX -->
            </tbody>
        </table>
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
								${modal.configuracion.mostrarIconoTitulo ? '<i class="bi bi-pencil-square me-2"></i>' : ''}
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
									<i class="bi bi-c-circle"></i>
									${sistema.año} ${sistema.nombre} - Sistema de gestión integral
								</p>
                            ` : ''}
                        </div>
                        <div class="col-md-6 text-end">
                            ${ui.layout.footer.mostrarVersion ? `
                                <p class="text-muted mb-0">
									<i class="bi bi-code-slash"></i>
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
					<i class="${moduloConfig.icono || 'bi bi-box'} me-3 fs-5"></i>
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
							<i class="bi bi-grid-3x3-gap-fill me-2 text-primary"></i>
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
						<i class="bi bi-arrow-clockwise"></i> Recargar Página
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
					<i class="bi bi-question-circle me-2"></i>
					<span class="flex-grow-1">${mensaje}</span>
					
					<div class="btn-group ms-2" role="group">
						<button type="button" 
								class="btn btn-sm btn-success" 
								onclick="sistemaNotificaciones.confirmar('${notificacionId}', true)">
							<i class="bi bi-check"></i>
							${textos.si || 'Sí'}
						</button>
						<button type="button" 
								class="btn btn-sm btn-secondary" 
								onclick="sistemaNotificaciones.confirmar('${notificacionId}', false)">
							<i class="bi bi-x"></i>
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
				<i class="bi bi-info-circle"></i>
				${descripcion}
			</small>
		`;
	}

	// Generar HTML de contenido de módulo
	generarContenidoModuloHTML(modulo, moduloConfig, tableId) {
		return `
			<div class="card shadow-sm">
				<div class="card-body p-0">
					${this.generarTablaConToolbar(tableId, modulo, moduloConfig)}
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
				<a href="#" 
				   class="list-group-item list-group-item-action ${activeClass}" 
				   data-modulo="${modulo}"
				   onclick="cargarModuloMenu('${modulo}'); 
							if(window.innerWidth < 992) { 
								document.getElementById('sidebar-wrapper').classList.remove('show'); 
							} 
							return false;">
					<i class="${moduloConfig.icono || 'bi bi-box'} me-2"></i>
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
					<i class="${moduloConfig.icono || 'bi bi-box'} me-3 text-primary"></i>
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


// ===== FUNCIONES DE NAVEGACIÓN CORREGIDAS =====

// Función para cargar módulo desde navbar
function cargarModuloDesdeNavbar(modulo) {
    console.log(`Cargando módulo desde navbar: ${modulo}`);
    cargarModulo(modulo, window.configManager.getTabIdPorModulo(modulo));
}

// Función para cargar módulo desde sidebar
function cargarModuloDesdeSidebar(modulo) {
    console.log(`Cargando módulo desde sidebar: ${modulo}`);
    cargarModulo(modulo, window.configManager.getTabIdPorModulo(modulo));
    cerrarSidebarEnMovil();
}

// Función universal para cargar módulos
function cargarModulo(modulo, tabId) {
    console.log(`Cargando módulo: ${modulo}, tabId: ${tabId}`);
    
    const contenidoModulo = document.getElementById('contenido-modulo');
    const moduloConfig = CONFIGURACION_SISTEMA.modulos[modulo];
    
    if (contenidoModulo && moduloConfig) {
        const tableId = `tabla${modulo.charAt(0).toUpperCase() + modulo.slice(1)}`;
        
        contenidoModulo.innerHTML = `
            <div class="card shadow-sm">
                <div class="card-header bg-white">
                    <h4 class="mb-0">
                        <i class="${moduloConfig.icono || 'bi bi-box'} me-2 text-primary"></i>
                        ${moduloConfig.plural}
                    </h4>
                    <p class="text-muted mb-0">${moduloConfig.descripcion || ''}</p>
                </div>
                <div class="card-body p-0">
                    ${window.generadorHTML.generarTablaConToolbar(tableId, modulo, moduloConfig)}
                </div>
            </div>
        `;
        
        // Inicializar la tabla
        setTimeout(() => {
            if (window.inicializarTabla) {
                window.inicializarTabla(tableId, modulo);
            }
        }, 100);
    }
}

// Cerrar navbar en móvil después de seleccionar
function cerrarNavbarMovil() {
    if (window.innerWidth < 992) {
        const navbarCollapse = document.getElementById('navbarMainContent');
        if (navbarCollapse && navbarCollapse.classList.contains('show')) {
            const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
                toggle: false
            });
            bsCollapse.hide();
        }
    }
}

// Cerrar sidebar en móvil
function cerrarSidebarEnMovil() {
    if (window.innerWidth < 992) {
        const sidebar = document.getElementById('sidebar-wrapper');
        if (sidebar) {
            sidebar.classList.remove('show');
            removeOverlay();
        }
    }
}

// Actualizar los event listeners del menú lateral
function actualizarMenuLateral() {
    const menuItems = document.querySelectorAll('#sidebar-wrapper .list-group-item');
    menuItems.forEach(item => {
        const modulo = item.getAttribute('data-modulo');
        item.onclick = function(e) {
            e.preventDefault();
            cargarModuloDesdeSidebar(modulo);
        };
    });
}
// Toggle overlay del navbar
function toggleNavbarOverlay() {
    setTimeout(() => {
        const navbarCollapse = document.getElementById('navbarContent');
        if (navbarCollapse && navbarCollapse.classList.contains('show')) {
            document.body.classList.add('navbar-open');
        } else {
            document.body.classList.remove('navbar-open');
        }
    }, 50);
}

// Cerrar navbar en móvil
function cerrarNavbarMovil() {
    if (window.innerWidth < 992) {
        const navbarCollapse = document.getElementById('navbarContent');
        if (navbarCollapse && navbarCollapse.classList.contains('show')) {
            const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
            if (bsCollapse) {
                bsCollapse.hide();
            }
        }
        document.body.classList.remove('navbar-open');
    }
}

// Listener para cerrar con el overlay
document.addEventListener('click', function(e) {
    if (window.innerWidth < 992 && document.body.classList.contains('navbar-open')) {
        const navbarCollapse = document.getElementById('navbarContent');
        const navbar = document.querySelector('.navbar');
        
        if (!navbar.contains(e.target)) {
            cerrarNavbarMovil();
        }
    }
});

// Listener para el colapso de Bootstrap
document.addEventListener('DOMContentLoaded', function() {
    const navbarCollapse = document.getElementById('navbarContent');
    if (navbarCollapse) {
        navbarCollapse.addEventListener('hidden.bs.collapse', function() {
            document.body.classList.remove('navbar-open');
        });
    }
});

// Configurar iconos de Bootstrap Table para usar Bootstrap Icons
$.extend($.fn.bootstrapTable.defaults, {
    icons: {
        paginationSwitchDown: 'bi-caret-down-square',
        paginationSwitchUp: 'bi-caret-up-square',
        refresh: 'bi-arrow-clockwise',
        toggleOff: 'bi-toggle-off',
        toggleOn: 'bi-toggle-on',
        columns: 'bi-list-ul',
        fullscreen: 'bi-arrows-fullscreen',
        detailOpen: 'bi-plus',
        detailClose: 'bi-dash'
    },
    iconSize: undefined,
    buttonsClass: 'primary',
    iconsPrefix: 'bi'
});

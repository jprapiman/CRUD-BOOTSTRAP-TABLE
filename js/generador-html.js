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
		const textos = this.config.textos;

		return `
			<nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm ${navegacion.navbar?.fijo ? 'fixed-top' : ''}">
				<div class="container-fluid">
					${navegacion.navbar?.mostrarLogo ? `
						<a class="navbar-brand d-flex align-items-center fw-bold" href="#">
							<i class="${branding.logo} fs-4 me-2"></i>
							${branding.nombre}
							<small class="badge bg-light text-primary ms-2 fs-3">v${this.config.sistema.version}</small>
						</a>
					` : ''}
					
					<!-- Botón para menú responsive -->
					<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMain" 
							aria-controls="navbarMain" aria-expanded="false" aria-label="Toggle navigation">
						<span class="navbar-toggler-icon"></span>
					</button>
					
					<div class="collapse navbar-collapse" id="navbarMain">
						${this.generarMenuPrincipal()}
						${navegacion.mostrarUsuario ? this.generarMenuUsuario() : ''}
					</div>
				</div>
			</nav>
		`;
	}

	// Menú principal mejorado
	generarMenuPrincipal() {
		const menu = this.config.navegacion.menuPrincipal || [];
		
		if (menu.length === 0) return '';

		return `
			<ul class="navbar-nav me-auto">
				${menu.map(item => {
					const activeClass = item.activo ? 'active' : '';
					return `
						<li class="nav-item">
							<a class="nav-link ${activeClass} d-flex align-items-center" href="${item.url}">
								<i class="${item.icono} me-2"></i>
								<span class="nav-text">${item.nombre}</span>
							</a>
						</li>
					`;
				}).join('')}
			</ul>
		`;
	}
    // Generar menú principal
    generarMenuPrincipal() {
        const menu = this.config.navegacion.menuPrincipal || [];
        
        if (menu.length === 0) return '';

        let menuHTML = '<ul class="navbar-nav me-auto">';
        
        menu.forEach(item => {
            const activeClass = item.activo ? 'active' : '';
            menuHTML += `
                <li class="nav-item">
                    <a class="nav-link ${activeClass}" href="${item.url}">
                        <i class="${item.icono}"></i>
                        ${item.nombre}
                    </a>
                </li>
            `;
        });
        
        menuHTML += '</ul>';
        return menuHTML;
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
    generarPestanas() {
        if (!this.config || !this.config.modulos) {
            console.error('❌ No hay configuración de módulos disponible');
            return '';
        }

        const modulos = Object.keys(this.config.modulos);
        let pestanasHTML = '';
        
        modulos.forEach((modulo, index) => {
            const moduloConfig = this.config.modulos[modulo];
            const activeClass = index === 0 ? 'active' : '';
            const tabId = this.convertirModuloATabId(modulo);
            
            // En generador-html.js, en generarPestanas(), modifica el onclick:
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
    // En generador-html.js, reemplaza el método generarModal:
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
// En generador-html.js, verifica que el método use la configuración:
	convertirModuloATabId(modulo) {
		// Usar configuración si está disponible
		if (this.config.mapeos && this.config.mapeos.moduloToTabId) {
			const tabIdConfigurado = this.config.mapeos.moduloToTabId[modulo];
			if (tabIdConfigurado) {
				return tabIdConfigurado;
			}
		}
		
		// Fallback a mapeo original
		const mapa = {
			'tipos_documento': 'tipos-documento',
			'tipos_promocion': 'tipos-promocion',
			'metodos_pago': 'metodos-pago'
		};
		
		return mapa[modulo] || modulo;
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
	generarEstructuraCompleta() {
		const textos = this.config.textos.titulos;

		return `
			<!-- Header con breadcrumb -->
			<div class="container-fluid mt-4">
				<div class="row mb-4">
					<div class="col-12">
						<nav aria-label="breadcrumb">
							<ol class="breadcrumb">
								<li class="breadcrumb-item"><a href="#"><i class="fas fa-home"></i> Inicio</a></li>
								<li class="breadcrumb-item active">Gestión</li>
							</ol>
						</nav>
						
						${this.generarTituloPrincipal()}
					</div>
				</div>

				<!-- Sistema de pestañas mejorado -->
				<div class="row">
					<div class="col-12">
						<div class="card shadow-sm">
							<div class="card-header bg-white border-bottom-0">
								<!-- Navegación de pestañas responsive -->
								<div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
									<h5 class="card-title mb-3 mb-md-0">
										<i class="fas fa-table me-2 text-primary"></i>
										Gestión del Sistema
									</h5>
									
									<!-- Filtros y búsqueda rápida -->
									<div class="d-flex gap-2 flex-wrap">
										<div class="input-group input-group-sm" style="width: 250px;">
											<span class="input-group-text bg-light">
												<i class="fas fa-search"></i>
											</span>
											<input type="text" class="form-control" placeholder="Buscar en todas las tablas..." id="busquedaGlobal">
										</div>
										<button class="btn btn-outline-primary btn-sm" onclick="exportarTodo()">
											<i class="fas fa-download me-1"></i>
											Exportar
										</button>
									</div>
								</div>
							</div>
							
							<div class="card-body p-0">
								<!-- Pestañas verticales en desktop, horizontales en mobile -->
								<div class="row g-0">
									<!-- Sidebar con pestañas en desktop -->
									<div class="col-lg-3 col-xl-2 d-none d-lg-block border-end bg-light">
										<div class="nav flex-column nav-pills h-100" id="v-pills-tab" role="tablist" aria-orientation="vertical">
											${this.generarPestanasVerticales()}
										</div>
									</div>
									
									<!-- Contenido principal -->
									<div class="col-lg-9 col-xl-10">
										<!-- Pestañas horizontales en mobile -->
										<div class="d-lg-none border-bottom">
											<ul class="nav nav-pills nav-fill px-3 pt-3" id="mobile-tab" role="tablist">
												${this.generarPestanas()}
											</ul>
										</div>
										
										<!-- Contenido de pestañas -->
										<div class="tab-content p-3" id="myTabContent">
											${this.generarContenidoPestanas()}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		`;
	}

    // Generar estructura completa de la aplicación
    generarAplicacionCompleta() {
        return `
            ${this.generarNavbar()}
            
            <!-- Contenido principal -->
            <div class="container-fluid mt-4">
                <!-- Área de notificaciones -->
                <div id="notificaciones" class="fixed-notifications"></div>

                ${this.generarTituloPrincipal()}
                
                <!-- Contenedor de pestañas y tablas -->
                <div id="contenedor-dinamico">
                    <!-- Nav tabs generadas dinámicamente -->
                    <ul class="nav nav-tabs" id="myTab" role="tablist">
                        ${this.generarPestanas()}
                    </ul>

                    <!-- Tab content generado dinámicamente -->
                    <div class="tab-content" id="myTabContent">
                        ${this.generarContenidoPestanas()}
                    </div>
                </div>
            </div>

            ${this.generarFooter()}
        `;
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
    // En generador-html.js, mejora el método inyectarAplicacionCompleta
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

    // Generar solo las pestañas (para reemplazo parcial)
    inyectarPestanas(containerId = 'pestanas-container') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = this.generarPestanas();
            console.log('✅ Pestañas inyectadas');
        }
    }

    // Generar solo el contenido (para reemplazo parcial)
    inyectarContenido(containerId = 'contenido-container') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = this.generarContenidoPestanas();
            console.log('✅ Contenido inyectado');
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

    // ===== MÉTODOS DE DEBUG Y VALIDACIÓN =====

    // Debug completo
    debug() {
        console.group('🏗️ GeneradorHTML - Debug Completo');
        console.log('📊 Configuración:', this.config);
        console.log('📋 Módulos disponibles:', Object.keys(this.config.modulos));
        console.log('🎨 Branding:', this.config.branding);
        console.log('🔧 UI:', this.config.ui);
        console.log('📝 Textos:', this.config.textos);
        console.groupEnd();
    }

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

    // Validar que todos los módulos tengan la configuración necesaria
    validarModulos() {
        const errores = [];
        
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
        
        console.log('✅ Todos los módulos son válidos');
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

// Función para cargar un módulo desde el menú vertical
function cargarModulo(modulo, tabId) {
    console.log(`📂 Cargando módulo: ${modulo}, tabId: ${tabId}`);
    
    // Actualizar título del módulo
    const tituloModulo = document.getElementById('titulo-modulo-actual');
    const moduloConfig = CONFIGURACION_SISTEMA.modulos[modulo];
    
    if (tituloModulo && moduloConfig) {
        tituloModulo.innerHTML = `
            <i class="${moduloConfig.icono || 'fas fa-cube'} me-2 text-primary"></i>
            ${moduloConfig.plural}
            <small class="text-muted ms-2">${moduloConfig.descripcion || ''}</small>
        `;
    }
    
    // Remover active de todos los items del menú
    document.querySelectorAll('.list-group-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Activar el item seleccionado
    const itemActivo = document.querySelector(`[data-modulo="${modulo}"]`);
    if (itemActivo) {
        itemActivo.classList.add('active');
    }
    
    // Generar contenido del módulo
    const contenidoModulo = document.getElementById('contenido-modulo');
    if (contenidoModulo) {
        const tableId = generarTableId(modulo);
        
        contenidoModulo.innerHTML = `
            <!-- Header de acciones -->
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="mb-0">Gestión de ${moduloConfig.plural.toLowerCase()}</h6>
                <div class="d-flex gap-2">
                    <button type="button" 
                            class="btn btn-primary btn-sm"
                            onclick="abrirModal('${modulo}')">
                        <i class="fas fa-plus me-1"></i>
                        Nuevo ${moduloConfig.singular}
                    </button>
                    <button type="button" 
                            class="btn btn-outline-secondary btn-sm"
                            onclick="recargarTablaActual()">
                        <i class="fas fa-sync-alt me-1"></i>
                        Actualizar
                    </button>
                </div>
            </div>
            
            <!-- Tabla -->
            <div class="table-responsive">
                ${generarEstructuraTabla(tableId, modulo, moduloConfig)}
            </div>
        `;
        
        // Inicializar la tabla si no existe
        setTimeout(() => {
            if (window.tableManager && !window.tableManager.tables[tableId]) {
                const columnasConfig = window.configManager ? 
                    window.configManager.getColumnasConfig(modulo) : 
                    (window.columnasConfig && window.columnasConfig[modulo]);
                
                if (columnasConfig) {
                    window.tableManager.inicializarTabla(tableId, modulo, columnasConfig);
                    window.tableManager.cargarTabla(tableId);
                }
            } else if (window.tableManager && window.tableManager.tables[tableId]) {
                window.tableManager.cargarTabla(tableId);
            }
        }, 100);
    }
}

// Generar estructura de tabla HTML
function generarEstructuraTabla(tableId, modulo, moduloConfig) {
    return `
        <table id="${tableId}" 
               class="table table-striped table-hover"
               data-toggle="table"
               data-pagination="true"
               data-search="true"
               data-show-refresh="true"
               data-show-columns="true"
               data-sort-name="id"
               data-sort-order="desc"
               data-page-size="10"
               data-page-list="[10, 25, 50, 100]">
            <thead class="table-dark">
                <tr>
                    <!-- Las columnas se generan dinámicamente -->
                </tr>
            </thead>
            <tbody>
                <!-- Los datos se cargan dinámicamente -->
            </tbody>
        </table>
    `;
}

// Función para recargar tabla actual
function recargarTablaActual() {
    const itemActivo = document.querySelector('.list-group-item.active');
    if (itemActivo) {
        const modulo = itemActivo.getAttribute('data-modulo');
        const tableId = generarTableId(modulo);
        
        if (window.tableManager && window.tableManager.tables[tableId]) {
            window.tableManager.cargarTabla(tableId);
            mostrarNotificacion('Tabla actualizada', 'success');
        }
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
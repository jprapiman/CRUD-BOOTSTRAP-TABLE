// configuracion-completa.js - Configuración unificada de todo el sistema
// configuracion-completa.js - Configuración unificada de todo el sistema

const CONFIGURACION_SISTEMA = {
    // ===== CONFIGURACIÓN GENERAL =====
    sistema: {
        nombre: "Minimarket Manager",
        version: "1.0.0",
        empresa: "Mi Empresa",
        año: 2024
    },

    // ===== CONFIGURACIÓN DE BRANDING =====
    branding: {
        nombre: "Minimarket Manager",
        nombreCorto: "MM",
        logo: "fas fa-store",
        empresa: "Mi Empresa",
        slogan: "Gestión integral de inventario y ventas",
        colores: {
            primario: "#0d6efd",
            secundario: "#6c757d",
            exito: "#198754",
            peligro: "#dc3545",
            advertencia: "#ffc107",
            info: "#0dcaf0",
            oscuro: "#212529",
            claro: "#f8f9fa"
        },
        favicon: "/favicon.ico"
    },

    // ===== CONFIGURACIÓN DE NAVEGACIÓN =====
    navegacion: {
        menuPrincipal: [
            { nombre: "Dashboard", icono: "fas fa-tachometer-alt", url: "#dashboard", activo: false },
            { nombre: "Reportes", icono: "fas fa-chart-bar", url: "#reportes", activo: false }
        ],
        menuUsuario: [
            { nombre: "Perfil", icono: "fas fa-user-circle", url: "#perfil" },
            { nombre: "Configuración", icono: "fas fa-cog", url: "#configuracion" },
            { separador: true },
            { nombre: "Cerrar Sesión", icono: "fas fa-sign-out-alt", accion: "logout", clase: "text-danger" }
        ],
        mostrarUsuario: true,
        usuarioDefecto: {
            nombre: "Usuario",
            avatar: "fas fa-user"
        }
    },

    // ===== CONFIGURACIÓN DE TEXTOS E INTERNACIONALIZACIÓN =====
    textos: {
        titulos: {
            panelAdmin: "Panel de Administración",
            gestionIntegral: "Gestión integral de inventario y ventas",
            cargando: "Cargando módulos desde configuración..."
        },
        botones: {
            nuevo: "Nuevo",
            editar: "Editar",
            eliminar: "Eliminar",
            guardar: "Guardar",
            actualizar: "Actualizar",
            cancelar: "Cancelar",
            cerrar: "Cerrar",
            buscar: "Buscar",
            limpiar: "Limpiar",
            exportar: "Exportar",
            imprimir: "Imprimir"
        },
        mensajes: {
            cargando: "Cargando...",
            noData: "No hay datos disponibles",
            error: "Ha ocurrido un error",
            exito: "Operación completada exitosamente",
            confirmacion: "¿Está seguro de realizar esta acción?",
            eliminacionConfirm: "¿Está seguro de eliminar este registro?",
            guardadoExito: "Registro guardado correctamente",
            actualizadoExito: "Registro actualizado correctamente",
            eliminadoExito: "Registro eliminado correctamente"
        },
        estados: {
            activo: "Activo",
            inactivo: "Inactivo",
            pendiente: "Pendiente",
            completado: "Completado",
            cancelado: "Cancelado"
        },
        comunes: {
            seleccione: "Seleccione...",
            todos: "Todos",
            ninguno: "Ninguno",
            si: "Sí",
            no: "No",
            opcional: "Opcional",
            requerido: "Requerido"
        }
    },

    // ===== CONFIGURACIÓN DE NOTIFICACIONES =====
    notificaciones: {
        duracion: 5000,
        posicion: "top-right",
        animacion: "fade",
        maxVisible: 3,
        tipos: {
            success: { 
                icono: "fa-check-circle", 
                clase: "alert-success",
                titulo: "Éxito"
            },
            error: { 
                icono: "fa-exclamation-circle", 
                clase: "alert-danger",
                titulo: "Error"
            },
            warning: { 
                icono: "fa-exclamation-triangle", 
                clase: "alert-warning",
                titulo: "Advertencia"
            },
            info: { 
                icono: "fa-info-circle", 
                clase: "alert-info",
                titulo: "Información"
            }
        }
    },

    // ===== CONFIGURACIÓN DE MODAL =====
    modal: {
        tamaño: "modal-lg",
        animacion: "fade",
        backdrop: true,
        keyboard: true,
        centrado: true,
        botones: {
            cancelar: { 
                texto: "Cancelar", 
                clase: "btn-outline-secondary", 
                icono: "fas fa-times" 
            },
            guardar: { 
                texto: "Guardar", 
                clase: "btn-primary", 
                icono: "fas fa-save" 
            },
            actualizar: { 
                texto: "Actualizar", 
                clase: "btn-primary", 
                icono: "fas fa-save" 
            }
        },
        configuracion: {
            mostrarIconoTitulo: true,
            cerrarConEscape: true,
            cerrarConClick: false
        }
    },

    // ===== CONFIGURACIÓN DE TABLAS =====
    tablas: {
        configuracionGlobal: {
            pageSize: 10,
            pageList: [10, 25, 50, 100],
            search: true,
            showColumns: true,
            showRefresh: true,
            showToggle: false,
            sortName: "id",
            sortOrder: "desc",
            pagination: true,
            sidePagination: "server",
            locale: "es-ES",
            icons: {
                refresh: "fas fa-sync",
                columns: "fas fa-th-list",
                export: "fas fa-download"
            }
        },
        clases: {
            tabla: "table table-striped table-hover",
            cabecera: "table-dark",
            filaHover: "table-hover"
        },
        textos: {
            buscar: "Buscar...",
            noEncontrado: "No se encontraron registros",
            cargando: "Cargando datos...",
            registrosPorPagina: "registros por página",
            mostrando: "Mostrando",
            de: "de",
            registros: "registros"
        }
    },

    // ===== CONFIGURACIÓN DE FORMATEO =====
    formateo: {
        fecha: {
            formato: "es-CL",
            opciones: { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
            },
            formatoCompleto: {
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }
        },
        moneda: {
            simbolo: "$",
            locale: "es-CL",
            decimales: 0,
            separadorMiles: "."
        },
        numero: {
            locale: "es-CL",
            decimales: 2
        },
        texto: {
            longitudMaximaDescripcion: 50,
            longitudMaximaTexto: 100,
            sufijo: "...",
            textoVacio: "N/A",
            claseTextoVacio: "text-muted"
        },
        boolean: {
            verdadero: { texto: "Sí", clase: "badge bg-success", icono: "fas fa-check" },
            falso: { texto: "No", clase: "badge bg-secondary", icono: "fas fa-times" }
        }
    },

    // ===== CONFIGURACIÓN DE VALIDACIONES =====
    validaciones: {
        globales: {
            requerido: { mensaje: "Este campo es requerido" },
            email: { 
                patron: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
                mensaje: "Ingrese un email válido" 
            },
            telefono: { 
                patron: /^\+?[0-9\s\-\(\)]+$/, 
                mensaje: "Ingrese un teléfono válido" 
            },
            rut: {
                patron: /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/,
                mensaje: "Formato de RUT inválido (12.345.678-9)"
            },
            numero: {
                min: 0,
                mensaje: "Debe ser un número válido"
            },
            texto: {
                minLength: 2,
                maxLength: 255,
                mensaje: "Texto debe tener entre 2 y 255 caracteres"
            }
        },
        porModulo: {
            usuarios: {
                username: { 
                    minLength: 3, 
                    maxLength: 50,
                    patron: /^[a-zA-Z0-9_]+$/,
                    mensaje: "Usuario debe tener 3-50 caracteres alfanuméricos" 
                },
                password: { 
                    minLength: 6, 
                    mensaje: "Contraseña debe tener al menos 6 caracteres" 
                }
            },
            productos: {
                sku: {
                    minLength: 3,
                    maxLength: 20,
                    patron: /^[A-Z0-9\-]+$/,
                    mensaje: "SKU debe ser alfanumérico en mayúsculas"
                },
                precio: {
                    min: 0.01,
                    mensaje: "El precio debe ser mayor a 0"
                }
            }
        }
    },

    // ===== CONFIGURACIÓN DE SEGURIDAD Y PERMISOS =====
    seguridad: {
        roles: {
            ADMIN: { 
                nombre: "Administrador", 
                descripcion: "Acceso completo al sistema",
                permisos: ["crear", "editar", "eliminar", "ver", "exportar"],
                modulos: ["*"],
                color: "danger"
            },
            SUPERVISOR: { 
                nombre: "Supervisor", 
                descripcion: "Supervisión y reportes",
                permisos: ["crear", "editar", "ver", "exportar"],
                modulos: ["productos", "categorias", "usuarios", "proveedores", "bodegas"],
                color: "warning"
            },
            CAJERO: { 
                nombre: "Cajero", 
                descripcion: "Operaciones de venta",
                permisos: ["crear", "ver"],
                modulos: ["productos", "categorias", "cajas"],
                color: "primary"
            },
            BODEGUERO: { 
                nombre: "Bodeguero", 
                descripcion: "Gestión de inventario",
                permisos: ["crear", "editar", "ver"],
                modulos: ["productos", "categorias", "proveedores", "bodegas"],
                color: "success"
            }
        },
        permisos: {
            crear: { nombre: "Crear", icono: "fas fa-plus" },
            editar: { nombre: "Editar", icono: "fas fa-edit" },
            eliminar: { nombre: "Eliminar", icono: "fas fa-trash" },
            ver: { nombre: "Ver", icono: "fas fa-eye" },
            exportar: { nombre: "Exportar", icono: "fas fa-download" }
        }
    },

    // ===== CONFIGURACIÓN DE MÓDULOS =====
    modulos: {
        categorias: {
            singular: 'Categoría',
            plural: 'Categorías',
            icono: 'fas fa-tags',
            genero: 'femenino',
            descripcion: 'Gestión de categorías de productos',
            tabId: 'categorias',
            tableId: 'tablaCategorias',
            
            columnasFormulario: [
                { name: 'nombre', label: 'Nombre', type: 'text', required: true, placeholder: 'Nombre de la categoría' },
                { name: 'descripcion', label: 'Descripción', type: 'textarea', required: false, placeholder: 'Descripción opcional' },
                { name: 'categoria_padre_id', label: 'Categoría Padre', type: 'select', required: false, options: [] },
                { name: 'activo', label: 'Activo', type: 'checkbox', required: false, checked: true }
            ],
            
            columnasTablas: [
                { field: 'id', title: 'ID', sortable: true, width: 80, align: 'center' },
                { field: 'nombre', title: 'Nombre', sortable: true, width: 200 },
                { field: 'descripcion', title: 'Descripción' },
                { field: 'categoria_padre_nombre', title: 'Categoría Padre', width: 150 },
                { field: 'activo', title: 'Estado', width: 100, align: 'center' },
                { field: 'created_at', title: 'Creado', width: 120 },
                { field: 'operate', title: 'Acciones', width: 120, align: 'center' }
            ]
        },

        productos: {
            singular: 'Producto',
            plural: 'Productos',
            icono: 'fas fa-box',
            genero: 'masculino',
            descripcion: 'Gestión de productos del inventario',
            tabId: 'productos',
            tableId: 'tablaProductos',
            
            columnasFormulario: [
                { name: 'sku', label: 'SKU', type: 'text', required: true, placeholder: 'Código único del producto' },
                { name: 'nombre', label: 'Nombre', type: 'text', required: true, placeholder: 'Nombre del producto' },
                { name: 'descripcion', label: 'Descripción', type: 'textarea', required: false, placeholder: 'Descripción del producto' },
                { name: 'precio_compra', label: 'Precio Compra', type: 'number', required: true, step: '0.01', min: '0' },
                { name: 'precio_venta', label: 'Precio Venta', type: 'number', required: true, step: '0.01', min: '0' },
                { name: 'unidad_medida', label: 'Unidad Medida', type: 'text', required: true, placeholder: 'kg, litros, unidades, etc.' },
                { name: 'categoria_ids', label: 'Categorías', type: 'select-multiple', required: false, options: [] },
                { name: 'tiene_iva', label: 'Aplica IVA', type: 'checkbox', required: false, checked: true },
                { name: 'activo', label: 'Activo', type: 'checkbox', required: false, checked: true }
            ],
            
            columnasTablas: [
                { field: 'id', title: 'ID', sortable: true, width: 80, align: 'center' },
                { field: 'sku', title: 'SKU', sortable: true, width: 120 },
                { field: 'nombre', title: 'Nombre', sortable: true, width: 200 },
                { field: 'descripcion', title: 'Descripción' },
                { field: 'precio_compra', title: 'P. Compra', sortable: true, width: 100, align: 'right' },
                { field: 'precio_venta', title: 'P. Venta', sortable: true, width: 100, align: 'right' },
                { field: 'unidad_medida', title: 'Unidad', width: 100, align: 'center' },
                { field: 'categorias', title: 'Categorías' },
                { field: 'tiene_iva', title: 'IVA', width: 80, align: 'center' },
                { field: 'activo', title: 'Estado', width: 100, align: 'center' },
                { field: 'operate', title: 'Acciones', width: 120, align: 'center' }
            ]
        },

        usuarios: {
            singular: 'Usuario',
            plural: 'Usuarios',
            icono: 'fas fa-users',
            genero: 'común',
            descripcion: 'Gestión de usuarios del sistema',
            tabId: 'usuarios',
            tableId: 'tablaUsuarios',
            
            columnasFormulario: [
                { name: 'username', label: 'Usuario', type: 'text', required: true, placeholder: 'Nombre de usuario' },
                { name: 'password', label: 'Contraseña', type: 'password', required: true, placeholder: 'Contraseña' },
                { name: 'nombre', label: 'Nombre', type: 'text', required: true, placeholder: 'Nombre real' },
                { name: 'apellido', label: 'Apellido', type: 'text', required: true, placeholder: 'Apellido' },
                { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'correo@ejemplo.com' },
                { name: 'telefono', label: 'Teléfono', type: 'tel', required: false, placeholder: '+56 9 1234 5678' },
                { name: 'rol', label: 'Rol', type: 'select', required: true, options: [
                    { value: 'ADMIN', text: 'Administrador' },
                    { value: 'CAJERO', text: 'Cajero' },
                    { value: 'BODEGUERO', text: 'Bodeguero' },
                    { value: 'SUPERVISOR', text: 'Supervisor' }
                ]},
                { name: 'activo', label: 'Activo', type: 'checkbox', required: false, checked: true }
            ],
            
            columnasTablas: [
                { field: 'id', title: 'ID', sortable: true, width: 80, align: 'center' },
                { field: 'username', title: 'Usuario', sortable: true, width: 120 },
                { field: 'nombre', title: 'Nombre', sortable: true, width: 120 },
                { field: 'apellido', title: 'Apellido', sortable: true, width: 120 },
                { field: 'email', title: 'Email', width: 200 },
                { field: 'telefono', title: 'Teléfono', width: 120 },
                { field: 'rol', title: 'Rol', sortable: true, width: 120 },
                { field: 'activo', title: 'Estado', width: 100, align: 'center' },
                { field: 'created_at', title: 'Creado', width: 120 },
                { field: 'operate', title: 'Acciones', width: 120, align: 'center' }
            ]
        },

        proveedores: {
            singular: 'Proveedor',
            plural: 'Proveedores',
            icono: 'fas fa-truck',
            genero: 'masculino',
            descripcion: 'Gestión de proveedores',
            tabId: 'proveedores',
            tableId: 'tablaProveedores',
            
            columnasFormulario: [
                { name: 'nombre', label: 'Nombre', type: 'text', required: true, placeholder: 'Nombre del proveedor' },
                { name: 'rut', label: 'RUT', type: 'text', required: true, placeholder: '12.345.678-9' },
                { name: 'telefono', label: 'Teléfono', type: 'tel', required: false, placeholder: '+56 9 1234 5678' },
                { name: 'email', label: 'Email', type: 'email', required: false, placeholder: 'proveedor@ejemplo.com' },
                { name: 'direccion', label: 'Dirección', type: 'textarea', required: false, placeholder: 'Dirección completa' },
                { name: 'activo', label: 'Activo', type: 'checkbox', required: false, checked: true }
            ],
            
            columnasTablas: [
                { field: 'id', title: 'ID', sortable: true, width: 80, align: 'center' },
                { field: 'nombre', title: 'Nombre', sortable: true, width: 200 },
                { field: 'rut', title: 'RUT', width: 120 },
                { field: 'telefono', title: 'Teléfono', width: 120 },
                { field: 'email', title: 'Email', width: 200 },
                { field: 'direccion', title: 'Dirección' },
                { field: 'activo', title: 'Estado', width: 100, align: 'center' },
                { field: 'created_at', title: 'Creado', width: 120 },
                { field: 'operate', title: 'Acciones', width: 120, align: 'center' }
            ]
        },

        bodegas: {
            singular: 'Bodega',
            plural: 'Bodegas',
            icono: 'fas fa-warehouse',
            genero: 'femenino',
            descripcion: 'Gestión de bodegas de almacenamiento',
            tabId: 'bodegas',
            tableId: 'tablaBodegas',
            
            columnasFormulario: [
                { name: 'nombre', label: 'Nombre', type: 'text', required: true, placeholder: 'Nombre de la bodega' },
                { name: 'codigo', label: 'Código', type: 'text', required: true, placeholder: 'Código único' },
                { name: 'direccion', label: 'Dirección', type: 'textarea', required: true, placeholder: 'Dirección de la bodega' },
                { name: 'es_principal', label: 'Bodega Principal', type: 'checkbox', required: false },
                { name: 'activa', label: 'Activa', type: 'checkbox', required: false, checked: true }
            ],
            
            columnasTablas: [
                { field: 'id', title: 'ID', sortable: true, width: 80, align: 'center' },
                { field: 'nombre', title: 'Nombre', sortable: true, width: 150 },
                { field: 'codigo', title: 'Código', width: 100, align: 'center' },
                { field: 'direccion', title: 'Dirección' },
                { field: 'es_principal', title: 'Principal', width: 100, align: 'center' },
                { field: 'activa', title: 'Estado', width: 100, align: 'center' },
                { field: 'created_at', title: 'Creado', width: 120 },
                { field: 'operate', title: 'Acciones', width: 120, align: 'center' }
            ]
        },

        cajas: {
            singular: 'Caja',
            plural: 'Cajas',
            icono: 'fas fa-cash-register',
            genero: 'femenino',
            descripcion: 'Gestión de cajas registradoras',
            tabId: 'cajas',
            tableId: 'tablaCajas',
            
            columnasFormulario: [
                { name: 'nombre', label: 'Nombre', type: 'text', required: true, placeholder: 'Nombre de la caja' },
                { name: 'codigo', label: 'Código', type: 'text', required: true, placeholder: 'Código único' },
                { name: 'bodega_id', label: 'Bodega', type: 'select', required: true, options: [] },
                { name: 'activa', label: 'Activa', type: 'checkbox', required: false, checked: true }
            ],
            
            columnasTablas: [
                { field: 'id', title: 'ID', sortable: true, width: 80, align: 'center' },
                { field: 'nombre', title: 'Nombre', sortable: true, width: 150 },
                { field: 'codigo', title: 'Código', width: 100, align: 'center' },
                { field: 'bodega_nombre', title: 'Bodega', width: 150 },
                { field: 'activa', title: 'Estado', width: 100, align: 'center' },
                { field: 'created_at', title: 'Creado', width: 120 },
                { field: 'operate', title: 'Acciones', width: 120, align: 'center' }
            ]
        },

        estados: {
            singular: 'Estado',
            plural: 'Estados',
            icono: 'fas fa-list',
            genero: 'masculino',
            descripcion: 'Gestión de estados del sistema',
            tabId: 'estados',
            tableId: 'tablaEstados',
            
            columnasFormulario: [
                { name: 'modulo', label: 'Módulo', type: 'select', required: true, options: [
                    { value: 'VENTA', text: 'Venta' },
                    { value: 'TURNO', text: 'Turno' },
                    { value: 'PAGO', text: 'Pago' },
                    { value: 'TRASLADO', text: 'Traslado' }
                ]},
                { name: 'codigo', label: 'Código', type: 'text', required: true, placeholder: 'Código único' },
                { name: 'nombre', label: 'Nombre', type: 'text', required: true, placeholder: 'Nombre del estado' },
                { name: 'descripcion', label: 'Descripción', type: 'textarea', required: false },
                { name: 'orden', label: 'Orden', type: 'number', required: true, min: '1' },
                { name: 'es_activo', label: 'Activo', type: 'checkbox', required: false, checked: true }
            ],
            
            columnasTablas: [
                { field: 'id', title: 'ID', sortable: true, width: 80, align: 'center' },
                { field: 'modulo', title: 'Módulo', sortable: true, width: 120 },
                { field: 'codigo', title: 'Código', width: 120 },
                { field: 'nombre', title: 'Nombre', sortable: true, width: 150 },
                { field: 'descripcion', title: 'Descripción' },
                { field: 'orden', title: 'Orden', width: 80, align: 'center' },
                { field: 'es_activo', title: 'Estado', width: 100, align: 'center' },
                { field: 'operate', title: 'Acciones', width: 120, align: 'center' }
            ]
        },

        tipos_documento: {
            singular: 'Tipo de Documento',
            plural: 'Tipos de Documento',
            icono: 'fas fa-file-invoice',
            genero: 'masculino',
            descripcion: 'Gestión de tipos de documentos',
            tabId: 'tipos-documento',
            tableId: 'tablaTiposDocumento',
            
            columnasFormulario: [
                { name: 'codigo', label: 'Código', type: 'text', required: true, placeholder: 'Código único' },
                { name: 'nombre', label: 'Nombre', type: 'text', required: true, placeholder: 'Nombre del tipo' },
                { name: 'descripcion', label: 'Descripción', type: 'textarea', required: false },
                { name: 'requiere_cliente', label: 'Requiere Cliente', type: 'checkbox', required: false },
                { name: 'serie', label: 'Serie', type: 'text', required: true, placeholder: 'Serie del documento' },
                { name: 'correlativo_actual', label: 'Correlativo Inicial', type: 'number', required: true, min: '1' },
                { name: 'activo', label: 'Activo', type: 'checkbox', required: false, checked: true }
            ],
            
            columnasTablas: [
                { field: 'id', title: 'ID', sortable: true, width: 80, align: 'center' },
                { field: 'codigo', title: 'Código', width: 100, align: 'center' },
                { field: 'nombre', title: 'Nombre', sortable: true, width: 150 },
                { field: 'descripcion', title: 'Descripción' },
                { field: 'requiere_cliente', title: 'Requiere Cliente', width: 120, align: 'center' },
                { field: 'serie', title: 'Serie', width: 80, align: 'center' },
                { field: 'correlativo_actual', title: 'Correlativo', width: 100, align: 'center' },
                { field: 'activo', title: 'Estado', width: 100, align: 'center' },
                { field: 'operate', title: 'Acciones', width: 120, align: 'center' }
            ]
        },

        tipos_promocion: {
            singular: 'Tipo de Promoción',
            plural: 'Tipos de Promoción',
            icono: 'fas fa-percentage',
            genero: 'masculino',
            descripcion: 'Gestión de tipos de promociones',
            tabId: 'tipos-promocion',
            tableId: 'tablaTiposPromocion',
            
            columnasFormulario: [
                { name: 'codigo', label: 'Código', type: 'text', required: true, placeholder: 'Código único' },
                { name: 'nombre', label: 'Nombre', type: 'text', required: true, placeholder: 'Nombre del tipo' },
                { name: 'descripcion', label: 'Descripción', type: 'textarea', required: false },
                { name: 'formula', label: 'Fórmula', type: 'textarea', required: true, placeholder: 'Fórmula de cálculo' },
                { name: 'activo', label: 'Activo', type: 'checkbox', required: false, checked: true }
            ],
            
            columnasTablas: [
                { field: 'id', title: 'ID', sortable: true, width: 80, align: 'center' },
                { field: 'codigo', title: 'Código', width: 120 },
                { field: 'nombre', title: 'Nombre', sortable: true, width: 150 },
                { field: 'descripcion', title: 'Descripción' },
                { field: 'formula', title: 'Fórmula' },
                { field: 'activo', title: 'Estado', width: 100, align: 'center' },
                { field: 'operate', title: 'Acciones', width: 120, align: 'center' }
            ]
        },

        metodos_pago: {
            singular: 'Método de Pago',
            plural: 'Métodos de Pago',
            icono: 'fas fa-credit-card',
            genero: 'masculino',
            descripcion: 'Gestión de métodos de pago',
            tabId: 'metodos-pago',
            tableId: 'tablaMetodosPago',
            
            columnasFormulario: [
                { name: 'codigo', label: 'Código', type: 'text', required: true, placeholder: 'Código único' },
                { name: 'nombre', label: 'Nombre', type: 'text', required: true, placeholder: 'Nombre del método' },
                { name: 'descripcion', label: 'Descripción', type: 'textarea', required: false },
                { name: 'requiere_referencia', label: 'Requiere Referencia', type: 'checkbox', required: false },
                { name: 'orden', label: 'Orden', type: 'number', required: true, min: '1' },
                { name: 'activo', label: 'Activo', type: 'checkbox', required: false, checked: true }
            ],
            
            columnasTablas: [
                { field: 'id', title: 'ID', sortable: true, width: 80, align: 'center' },
                { field: 'codigo', title: 'Código', width: 120 },
                { field: 'nombre', title: 'Nombre', sortable: true, width: 150 },
                { field: 'descripcion', title: 'Descripción' },
                { field: 'requiere_referencia', title: 'Requiere Ref.', width: 120, align: 'center' },
                { field: 'orden', title: 'Orden', width: 80, align: 'center' },
                { field: 'activo', title: 'Estado', width: 100, align: 'center' },
                { field: 'operate', title: 'Acciones', width: 120, align: 'center' }
            ]
        }
    },

    // ===== ORDEN DE MÓDULOS =====
    ordenModulos: [
        'productos',
        'categorias', 
        'usuarios',
        'proveedores',
        'bodegas',
        'cajas',
        'estados',
        'tipos_documento',
        'tipos_promocion',
        'metodos_pago'
    ],


    // ===== CONFIGURACIÓN DE LA API =====
    api: {
        baseUrl: 'api/router.php',
        timeout: 30000,
        retries: 3,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        endpoints: {
            auth: '/auth',
            upload: '/upload',
            export: '/export'
        },
        modulosPermitidos: [
            'categorias', 'productos', 'usuarios', 'proveedores',
            'bodegas', 'cajas', 'estados', 'tipos_documento',
            'tipos_promocion', 'metodos_pago'
        ],
        paginacion: {
            defaultPage: 1,
            defaultLimit: 10,
            maxLimit: 1000
        }
    },

    // ===== CONFIGURACIÓN DE LA INTERFAZ =====
    ui: {
        temas: {
            primario: 'bg-primary',
            secundario: 'bg-secondary',
            exito: 'bg-success',
            peligro: 'bg-danger',
            advertencia: 'bg-warning',
            info: 'bg-info'
        },
        iconos: {
            crear: 'fas fa-plus',
            editar: 'fas fa-edit',
            eliminar: 'fas fa-trash',
            guardar: 'fas fa-save',
            cancelar: 'fas fa-times',
            buscar: 'fas fa-search',
            actualizar: 'fas fa-sync',
            exportar: 'fas fa-download',
            imprimir: 'fas fa-print',
            configuracion: 'fas fa-cog',
            usuario: 'fas fa-user',
            logout: 'fas fa-sign-out-alt'
        },
        layout: {
            sidebar: {
                habilitado: false,
                ancho: '250px',
                colapsible: true
            },
            navbar: {
                fijo: true,
                altura: '70px',
                mostrarLogo: true,
                mostrarMenuUsuario: true
            },
            footer: {
                mostrar: true,
                fijo: false,
                mostrarCopyright: true,
                mostrarVersion: true
            }
        },
        animaciones: {
            duracion: 300,
            tipo: 'ease-in-out',
            habilitadas: true
        }
    },

    // ===== CONFIGURACIÓN DE REPORTES =====
    reportes: {
        formatos: ['pdf', 'excel', 'csv'],
        configuracionPDF: {
            orientacion: 'portrait',
            tamano: 'a4',
            margenes: { top: 20, right: 20, bottom: 20, left: 20 }
        },
        configuracionExcel: {
            autor: 'Sistema Minimarket',
            hoja: 'Datos'
        }
    },

    // ===== CONFIGURACIÓN DE LOGGING Y DEBUG =====
    debug: {
        habilitado: true,
        nivel: 'info',
        mostrarEnConsola: true,
        guardarEnStorage: false,
        componentes: {
            api: true,
            tablas: true,
            modales: true,
            validaciones: true
        }
    }
};
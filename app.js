window.onload = () => {
    cargarSesion();
    if (!localStorage.getItem('bienvenidaMostrada')) {
        document.getElementById('modal-bienvenida').classList.remove('hidden');
    }
};

const API_PRODUCTOS = 'http://localhost:8080/api/productos';
const API_USUARIOS  = 'http://localhost:8080/api/usuarios';
let productosLocales = [];
let carritoArray     = [];
let sesionActual     = null;

// ==========================================
// 1. INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    cargarCatalogo();

    const inputBusqueda = document.getElementById('input-busqueda');
    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', (e) => {
            const textoBuscado = e.target.value.toLowerCase();
            const filtrados = productosLocales.filter(p =>
                p.nombre.toLowerCase().includes(textoBuscado) ||
                p.tipoProducto.toLowerCase().includes(textoBuscado)
            );
            renderizarProductos(filtrados);
        });
    }

    const formCheckout = document.getElementById('form-checkout');
    if (formCheckout) {
        formCheckout.addEventListener('submit', async (e) => {
            e.preventDefault();

            const inputDir    = document.getElementById('envio-dir');
            const inputNombre = document.getElementById('envio-nombre');
            if (!inputDir || !inputNombre) return;

            const idPedido   = "CB-" + Math.floor(Math.random() * 9000 + 1000);
            const pagoMetodo = document.getElementById('pago-metodo')?.value || "Efecty";

            document.getElementById('track-id').innerText    = `ID: #${idPedido}`;
            document.getElementById('track-pago').innerText  = `Confirmado vía ${pagoMetodo}`;
            document.getElementById('track-envio').innerText = "En preparación (Bodega Turbaco)";

            cerrarCheckout();
            document.getElementById('modal-seguimiento').classList.remove('hidden');

            for (const item of carritoArray) {
                try {
                    await fetch(`${API_PRODUCTOS}/comprar/${item.producto.id}?cantidad=${item.cantidad}`, { method: 'POST' });
                } catch (error) {
                    console.error("Error en stock:", item.producto.id);
                }
            }

            mostrarNotificacion(`Pedido ${idPedido} para ${inputNombre.value} exitoso`, "exito");
            carritoArray = [];
            dibujarCarrito();
            formCheckout.reset();
            cargarCatalogo();
        });
    }

    // Login real contra el backend
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const inputs   = formLogin.querySelectorAll('input');
            const correo   = inputs[0].value.trim();
            const password = inputs[1].value;

            try {
                const resp = await fetch(`${API_USUARIOS}/login`, {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({ correo, contrasena: password })
                });
                const datos = await resp.json();

                if (datos.exito) {
                    sesionActual = { nombre: datos.nombre, correo: datos.correo, rol: datos.rol };
                    localStorage.setItem('cherryblossom_sesion', JSON.stringify(sesionActual));
                    actualizarNavbarSesion();
                    cerrarLogin();
                    mostrarNotificacion(`¡Bienvenido/a, ${datos.nombre}!`, 'exito');
                } else {
                    mostrarNotificacion(datos.mensaje || 'Credenciales incorrectas', 'error');
                }
            } catch (_) {
                mostrarNotificacion('No se pudo conectar al servidor', 'error');
            }
        });
    }

    // Registro (demo — no persiste en el servidor)
    const formReg = document.getElementById('form-registro');
    if (formReg) {
        formReg.addEventListener('submit', (e) => {
            e.preventDefault();
            mostrarNotificacion("¡Cuenta creada exitosamente!", "exito");
            toggleAuth('login');
        });
    }

    // Formulario de nuevo producto (panel admin)
    const formNuevo = document.getElementById('form-nuevo-producto');
    if (formNuevo) {
        formNuevo.addEventListener('submit', crearNuevoProducto);
    }
});

// ==========================================
// 2. MODALES Y TOASTS (INTERFAZ)
// ==========================================
function cerrarBienvenida() {
    document.getElementById('modal-bienvenida').classList.add('hidden');
    localStorage.setItem('bienvenidaMostrada', 'true');
}

function abrirLogin()    { document.getElementById('modal-login').classList.remove('hidden'); }
function cerrarLogin()   { document.getElementById('modal-login').classList.add('hidden'); }
function abrirCarrito()  { document.getElementById('modal-carrito').classList.remove('hidden'); }
function cerrarCarrito() { document.getElementById('modal-carrito').classList.add('hidden'); }
function cerrarCheckout(){ document.getElementById('modal-checkout').classList.add('hidden'); }

function cerrarSeguimiento() {
    document.getElementById('modal-seguimiento').classList.add('hidden');
}

function toggleAuth(modo) {
    const fLogin = document.getElementById('form-login');
    const fReg   = document.getElementById('form-registro');
    const tLogin = document.getElementById('tab-login');
    const tReg   = document.getElementById('tab-registro');
    if (!fLogin || !fReg || !tLogin || !tReg) return;

    if (modo === 'login') {
        fLogin.classList.remove('hidden'); fReg.classList.add('hidden');
        tLogin.classList.add('text-pink-500', 'border-b-2', 'border-pink-500'); tLogin.classList.remove('text-gray-400');
        tReg.classList.remove('text-pink-500', 'border-b-2', 'border-pink-500'); tReg.classList.add('text-gray-400');
    } else {
        fReg.classList.remove('hidden'); fLogin.classList.add('hidden');
        tReg.classList.add('text-pink-500', 'border-b-2', 'border-pink-500'); tReg.classList.remove('text-gray-400');
        tLogin.classList.remove('text-pink-500', 'border-b-2', 'border-pink-500'); tLogin.classList.add('text-gray-400');
    }
}

function mostrarNotificacion(mensaje, tipo = 'exito') {
    const contenedor = document.getElementById('toast-container');
    const toast      = document.createElement('div');
    const color  = tipo === 'exito' ? 'bg-white text-gray-800 border-pink-200' : 'bg-gray-900 text-white border-gray-800';
    const icono  = tipo === 'exito'
        ? '<i class="fa-solid fa-circle-check text-pink-500"></i>'
        : '<i class="fa-solid fa-circle-exclamation text-red-500"></i>';

    toast.className = `toast-enter flex items-center gap-3 ${color} border-2 px-5 py-4 rounded-2xl shadow-xl min-w-[250px]`;
    toast.innerHTML = `${icono} <span class="font-bold text-sm">${mensaje}</span>`;
    contenedor.appendChild(toast);

    setTimeout(() => {
        toast.classList.replace('toast-enter', 'toast-exit');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// ==========================================
// 3. CATÁLOGO Y FONDOS DINÁMICOS
// ==========================================
async function cargarCatalogo() {
    try {
        const respuesta = await fetch(API_PRODUCTOS);
        const datos     = await respuesta.json();
        if (datos && datos.length > 0) {
            productosLocales = datos;
        } else {
            cargarPlanC();
        }
    } catch (error) {
        cargarPlanC();
    }
    renderizarProductos(productosLocales);
}

function cargarPlanC() {
    productosLocales = [
        { id: 1,  tipoProducto: "MANGA",  nombre: "Dragon Ball Z Vol. 1",          precio: 45000, stock: 10, imagenUrl: "https://m.media-amazon.com/images/I/81c-89S2XGL.jpg" },
        { id: 2,  tipoProducto: "MANHWA", nombre: "La noche que llega a la ribera", precio: 60000, stock: 5,  imagenUrl: "https://m.media-amazon.com/images/I/71R2vH5Y3dL.jpg" },
        { id: 3,  tipoProducto: "MANGA",  nombre: "Attack on Titan Vol. 34",        precio: 78000, stock: 15, imagenUrl: "https://m.media-amazon.com/images/I/815uVxpIP3L.jpg" },
        { id: 4,  tipoProducto: "MANHWA", nombre: "Solo Leveling Vol. 1",           precio: 29000, stock: 20, imagenUrl: "https://m.media-amazon.com/images/I/718yG0Z7j1L.jpg" },
        { id: 5,  tipoProducto: "FIGURA", nombre: "One Piece Roronoa Zoro",         precio: 74000, stock: 3,  imagenUrl: "https://m.media-amazon.com/images/I/71J1b80QYcL.jpg" },
        { id: 6,  tipoProducto: "ALBUM",  nombre: "BLACKPINK [BORN PINK]",          precio: 38000, stock: 8,  imagenUrl: "https://m.media-amazon.com/images/I/51wV33b6mBL.jpg" }
    ];
}

function renderizarProductos(lista) {
    const contenedor = document.getElementById('contenedor-productos');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    lista.forEach(p => {
        const imgSegura = p.imagenUrl || 'https://via.placeholder.com/300x400?text=Asian+Spot';
        const colores   = {
            MANGA:    'bg-pink-500',
            MANHWA:   'bg-cyan-500',
            FIGURA:   'bg-green-500',
            ALBUM:    'bg-purple-500',
            ROPA:     'bg-orange-500',
            ACCESORIO:'bg-yellow-500',
            POSTER:   'bg-red-500'
        };
        const badge = colores[p.tipoProducto] || 'bg-gray-500';

        contenedor.innerHTML += `
            <div class="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all border-2 border-pink-50 flex flex-col justify-between h-full group">
                <div class="relative overflow-hidden rounded-xl mb-4 h-64 bg-slate-100">
                    <span class="absolute top-2 left-2 ${badge} text-white text-[10px] font-bold px-2 py-1 rounded-full z-10 uppercase">${p.tipoProducto}</span>
                    <img src="${imgSegura}" alt="${p.nombre}" class="object-cover w-full h-full group-hover:scale-110 transition duration-500" onerror="this.src='https://via.placeholder.com/300x400?text=Asian+Spot'">
                </div>
                <div>
                    <h4 class="font-bold text-gray-800 text-sm leading-tight mb-2 line-clamp-2">${p.nombre}</h4>
                    <div class="flex justify-between items-end mt-2">
                        <div>
                            <p class="text-[10px] text-gray-400 uppercase font-bold">Stock: ${p.stock}</p>
                            <span class="text-xl font-black text-gray-900">$${p.precio.toLocaleString()}</span>
                        </div>
                        <button onclick="procesarCompra(${p.id})" class="bg-gray-900 text-white w-10 h-10 rounded-xl hover:bg-pink-500 transition-colors flex items-center justify-center">
                            <i class="fa-solid fa-cart-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

function filtrar(categoria) {
    const config = {
        'MANGA':  { c: 'bg-orange-50', t: '🌸 Colección Manga',       s: 'Las mejores historias en blanco y negro' },
        'MANHWA': { c: 'bg-cyan-50',   t: '💥 Webtoons y Manhwa',      s: 'Acción, magia y romance a todo color' },
        'FIGURA': { c: 'bg-green-50',  t: '✨ Figuras de Colección',   s: 'Tus personajes favoritos en tu estantería' },
        'ALBUM':  { c: 'bg-purple-50', t: '🎤 Zona K-Pop',             s: 'Álbumes y mercancía oficial' },
        'TODOS':  { c: 'bg-slate-50',  t: 'Catálogo General',          s: 'Descubre todas nuestras novedades' }
    };

    const actual = config[categoria] || config['TODOS'];
    document.body.className = `font-sans transition-colors duration-700 ${actual.c}`;
    document.getElementById('titulo-seccion').innerText    = actual.t;
    document.getElementById('subtitulo-seccion').innerText = actual.s;

    if (categoria === 'TODOS') {
        renderizarProductos(productosLocales);
    } else {
        renderizarProductos(productosLocales.filter(p => p.tipoProducto === categoria));
    }
}

// ==========================================
// 4. EL CARRITO INTELIGENTE
// ==========================================
async function procesarCompra(id) {
    const productoBase  = productosLocales.find(p => p.id === id);
    if (!productoBase) return;

    const itemEnCarrito = carritoArray.find(item => item.producto.id === id);
    if (itemEnCarrito) {
        cambiarCantidad(id, 1);
    } else {
        if (productoBase.stock > 0) {
            carritoArray.push({ producto: productoBase, cantidad: 1 });
            mostrarNotificacion(`Añadido: ${productoBase.nombre}`, 'exito');
            dibujarCarrito();
        } else {
            mostrarNotificacion(`Producto agotado.`, 'error');
        }
    }
}

function cambiarCantidad(idProducto, cambio) {
    const item = carritoArray.find(i => i.producto.id === idProducto);
    if (!item) return;
    const nuevaCantidad = item.cantidad + cambio;
    if (nuevaCantidad < 1) return;
    if (nuevaCantidad > item.producto.stock) {
        mostrarNotificacion(`Solo hay ${item.producto.stock} en stock.`, 'error');
        return;
    }
    item.cantidad = nuevaCantidad;
    dibujarCarrito();
}

function eliminarDelCarrito(idProducto) {
    carritoArray = carritoArray.filter(item => item.producto.id !== idProducto);
    dibujarCarrito();
}

function dibujarCarrito() {
    const contenedor  = document.getElementById('items-carrito');
    const labelTotal  = document.getElementById('total-carrito');
    const badgeCart   = document.getElementById('cart-count');

    let totalDinero = 0, totalItems = 0;
    carritoArray.forEach(item => {
        totalDinero += item.producto.precio * item.cantidad;
        totalItems  += item.cantidad;
    });

    if (badgeCart) badgeCart.innerText = totalItems;

    if (carritoArray.length === 0) {
        contenedor.innerHTML = '<p class="text-gray-400 text-center mt-10 text-sm font-bold">Tu carrito está vacío 🌸</p>';
        labelTotal.innerText = "$0";
        return;
    }

    contenedor.innerHTML = '';
    carritoArray.forEach(item => {
        contenedor.innerHTML += `
            <div class="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 group">
                <img src="${item.producto.imagenUrl}" class="w-14 h-20 object-cover rounded-md" onerror="this.src='https://via.placeholder.com/300x400?text=Asian+Spot'">
                <div class="flex-1">
                    <h5 class="text-[11px] font-bold text-gray-800 uppercase line-clamp-1">${item.producto.nombre}</h5>
                    <span class="text-sm font-black text-pink-500">$${(item.producto.precio * item.cantidad).toLocaleString()}</span>
                    <div class="flex items-center gap-3 mt-2">
                        <div class="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                            <button onclick="cambiarCantidad(${item.producto.id}, -1)" class="px-2 bg-gray-50 hover:bg-pink-500 hover:text-white font-bold text-xs">-</button>
                            <span class="px-2 text-xs font-bold w-6 text-center">${item.cantidad}</span>
                            <button onclick="cambiarCantidad(${item.producto.id}, 1)"  class="px-2 bg-gray-50 hover:bg-pink-500 hover:text-white font-bold text-xs">+</button>
                        </div>
                    </div>
                </div>
                <button onclick="eliminarDelCarrito(${item.producto.id})" class="text-gray-300 hover:text-red-500 bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
                    <i class="fa-solid fa-trash text-xs"></i>
                </button>
            </div>
        `;
    });

    labelTotal.innerText = "$" + totalDinero.toLocaleString();
}

function finalizarCompra() {
    if (carritoArray.length === 0) {
        mostrarNotificacion("Tu carrito está vacío.", "error");
        return;
    }
    cerrarCarrito();
    document.getElementById('modal-checkout').classList.remove('hidden');
    document.getElementById('checkout-total').innerText = document.getElementById('total-carrito').innerText;
}

// ==========================================
// 5. SISTEMA DE SESIÓN
// ==========================================
function cargarSesion() {
    const datos = localStorage.getItem('cherryblossom_sesion');
    if (datos) {
        sesionActual = JSON.parse(datos);
        actualizarNavbarSesion();
    }
}

function actualizarNavbarSesion() {
    const zona = document.getElementById('zona-usuario');
    if (!zona) return;

    if (sesionActual) {
        const esAdmin    = sesionActual.rol === 'ADMINISTRADOR';
        const primerNomb = sesionActual.nombre.split(' ')[0];

        zona.innerHTML = `
            ${esAdmin ? `
                <button onclick="abrirAdminPanel()"
                        title="Panel de Administración"
                        class="bg-pink-500 text-white w-9 h-9 rounded-xl flex items-center justify-center hover:bg-pink-600 transition-all shadow-md shadow-pink-200 animate-pulse">
                    <i class="fa-solid fa-shield-halved text-sm"></i>
                </button>
            ` : ''}
            <span class="text-xs font-black text-gray-600 hidden md:flex items-center gap-1">
                <i class="fa-regular fa-circle-user text-pink-400"></i> ${primerNomb}
            </span>
            <button onclick="cerrarSesion()" title="Cerrar Sesión"
                    class="text-gray-400 hover:text-red-400 transition-colors text-lg">
                <i class="fa-solid fa-right-from-bracket"></i>
            </button>
        `;
    } else {
        zona.innerHTML = `
            <button onclick="abrirLogin()" class="text-gray-400 hover:text-pink-500 transition-colors text-xl">
                <i class="fa-regular fa-circle-user"></i>
            </button>
        `;
    }
}

function cerrarSesion() {
    sesionActual = null;
    localStorage.removeItem('cherryblossom_sesion');
    actualizarNavbarSesion();
    mostrarNotificacion('Sesión cerrada. ¡Hasta pronto! 🌸', 'exito');
}

// ==========================================
// 6. PANEL DE ADMINISTRACIÓN
// ==========================================
function abrirAdminPanel() {
    if (!sesionActual || sesionActual.rol !== 'ADMINISTRADOR') return;
    cambiarTabAdmin('estadisticas');
    generarEstadisticas();
    generarTransacciones();
    renderizarListaProductosAdmin();
    document.getElementById('modal-admin').classList.remove('hidden');
}

function cerrarAdminPanel() {
    document.getElementById('modal-admin').classList.add('hidden');
}

function cambiarTabAdmin(tab) {
    const panelEst  = document.getElementById('contenido-estadisticas');
    const panelProd = document.getElementById('contenido-productos');
    const tabEst    = document.getElementById('tab-admin-estadisticas');
    const tabProd   = document.getElementById('tab-admin-productos');

    const activo   = 'py-4 font-black text-sm uppercase tracking-wider text-pink-500 border-b-2 border-pink-500 transition-all';
    const inactivo = 'py-4 font-black text-sm uppercase tracking-wider text-gray-400 hover:text-gray-700 transition-all border-b-2 border-transparent';

    if (tab === 'estadisticas') {
        panelEst.classList.remove('hidden'); panelProd.classList.add('hidden');
        tabEst.className  = activo;
        tabProd.className = inactivo;
    } else {
        panelProd.classList.remove('hidden'); panelEst.classList.add('hidden');
        tabProd.className = activo;
        tabEst.className  = inactivo;
        renderizarListaProductosAdmin();
    }
}

function generarEstadisticas() {
    const visitas      = Math.floor(Math.random() * 700 + 900);
    const pedidos      = Math.floor(Math.random() * 40  + 20);
    const precioMedio  = Math.floor(Math.random() * 100000 + 50000);
    const ingresoDia   = pedidos * precioMedio;
    const ingresoSem   = ingresoDia * (Math.floor(Math.random() * 4) + 5);
    const clientes     = Math.floor(Math.random() * 200 + 150);
    const tops         = ['One Piece Vol. 100', 'BTS - Proof', 'Gojo Satoru Figure', 'Spy x Family', 'Blackpink Album'];
    const topProducto  = tops[Math.floor(Math.random() * tops.length)];

    document.getElementById('stat-visitas').innerText        = visitas.toLocaleString();
    document.getElementById('stat-pedidos').innerText        = pedidos;
    document.getElementById('stat-ingresos-dia').innerText   = '$' + ingresoDia.toLocaleString();
    document.getElementById('stat-ingresos-semana').innerText= '$' + ingresoSem.toLocaleString();
    document.getElementById('stat-productos').innerText      = productosLocales.length;
    document.getElementById('stat-clientes').innerText       = clientes;
    document.getElementById('stat-top').innerText            = topProducto;

    // Gráfico de barras (flujo semanal)
    const dias   = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const valores = dias.map(() => Math.floor(Math.random() * 80 + 15));
    const maxVal  = Math.max(...valores);

    const chart  = document.getElementById('chart-flujo');
    const labels = document.getElementById('chart-labels');
    if (!chart || !labels) return;

    chart.innerHTML = valores.map((v, i) => {
        const pct    = Math.round((v / maxVal) * 100);
        const hoy    = i === 6;
        const color  = hoy ? 'bg-pink-500 shadow-lg shadow-pink-200' : 'bg-pink-200';
        return `
            <div class="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <span class="text-[10px] font-bold ${hoy ? 'text-pink-500' : 'text-gray-400'}">${v}</span>
                <div class="w-full rounded-t-lg ${color} transition-all duration-700" style="height:${pct}%"></div>
            </div>
        `;
    }).join('');

    labels.innerHTML = dias.map((d, i) => {
        const hoy = i === 6;
        return `<span class="flex-1 text-center text-[10px] font-bold ${hoy ? 'text-pink-500' : 'text-gray-400'}">${d}</span>`;
    }).join('');
}

function generarTransacciones() {
    const prods   = ['One Piece Vol. 100', 'BTS - Proof', 'Gojo Satoru Fig.', 'Spy x Family V.1', 'Blackpink Album', 'BJ Alex Manhwa', 'Demon Slayer Fig.'];
    const metodos = ['PSE', 'Efecty', 'Tarjeta'];
    const colores = ['bg-green-100 text-green-600', 'bg-blue-100 text-blue-600', 'bg-purple-100 text-purple-600'];

    const lista = Array.from({ length: 5 }, (_, i) => ({
        id:      `CB-${Math.floor(Math.random() * 9000 + 1000)}`,
        prod:    prods[Math.floor(Math.random() * prods.length)],
        monto:   Math.floor(Math.random() * 300000 + 30000),
        metodo:  metodos[Math.floor(Math.random() * metodos.length)],
        hora:    `${String(Math.floor(Math.random() * 12) + 8).padStart(2,'0')}:${String(Math.floor(Math.random() * 60)).padStart(2,'0')}`,
        color:   colores[i % colores.length]
    }));

    const cont = document.getElementById('tabla-transacciones');
    if (!cont) return;

    cont.innerHTML = lista.map(t => `
        <div class="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 ${t.color} rounded-lg flex items-center justify-center text-xs">
                    <i class="fa-solid fa-check"></i>
                </div>
                <div>
                    <p class="text-xs font-black text-gray-800">${t.prod}</p>
                    <p class="text-[10px] text-gray-400 font-bold">${t.id} · ${t.metodo} · ${t.hora}</p>
                </div>
            </div>
            <span class="text-sm font-black text-gray-900">$${t.monto.toLocaleString()}</span>
        </div>
    `).join('');
}

function renderizarListaProductosAdmin() {
    const lista = document.getElementById('lista-productos-admin');
    if (!lista) return;

    lista.innerHTML = productosLocales.map(p => `
        <div class="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2 border border-slate-100">
            <img src="${p.imagenUrl}" class="w-8 h-10 object-cover rounded" onerror="this.src='https://via.placeholder.com/100?text=?'">
            <div class="flex-1 min-w-0">
                <p class="text-xs font-black text-gray-800 truncate">${p.nombre}</p>
                <p class="text-[10px] text-gray-400 font-bold">${p.tipoProducto} · Stock: ${p.stock}</p>
            </div>
            <span class="text-sm font-black text-gray-900 whitespace-nowrap">$${p.precio.toLocaleString()}</span>
        </div>
    `).join('');
}

async function crearNuevoProducto(e) {
    e.preventDefault();

    const nombre    = document.getElementById('np-nombre').value.trim();
    const tipo      = document.getElementById('np-tipo').value;
    const precio    = parseFloat(document.getElementById('np-precio').value);
    const stock     = parseInt(document.getElementById('np-stock').value);
    const imagenUrl = document.getElementById('np-imagen').value.trim();

    const body = { tipoProducto: tipo, nombre, precio, stock, imagenUrl };

    try {
        const resp = await fetch(`${API_PRODUCTOS}/crear`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(body)
        });

        if (resp.ok) {
            mostrarNotificacion(`¡"${nombre}" añadido al catálogo!`, 'exito');
            document.getElementById('form-nuevo-producto').reset();
            document.getElementById('np-preview').classList.add('hidden');
            await cargarCatalogo();
            renderizarListaProductosAdmin();
            document.getElementById('stat-productos').innerText = productosLocales.length;
        } else {
            mostrarNotificacion('Error al crear el producto', 'error');
        }
    } catch (_) {
        mostrarNotificacion('Error de conexión con el servidor', 'error');
    }
}

// Vista previa al escribir la URL de imagen
function previsualizarImagen(url) {
    const preview     = document.getElementById('np-preview');
    const img         = document.getElementById('np-preview-img');
    const pNombre     = document.getElementById('np-preview-nombre');
    const pTipo       = document.getElementById('np-preview-tipo');
    const pPrecio     = document.getElementById('np-preview-precio');

    const nombre  = document.getElementById('np-nombre')?.value  || 'Sin nombre';
    const tipo    = document.getElementById('np-tipo')?.value    || '';
    const precio  = parseFloat(document.getElementById('np-precio')?.value || 0);

    if (url && url.startsWith('http')) {
        img.src              = url;
        pNombre.innerText    = nombre;
        pTipo.innerText      = tipo;
        pPrecio.innerText    = precio ? '$' + precio.toLocaleString() : '';
        preview.classList.remove('hidden');
    } else {
        preview.classList.add('hidden');
    }
}

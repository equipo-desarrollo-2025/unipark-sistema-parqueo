// js/auth.js - Sistema de Autenticación
class AuthSystem {
    constructor() {
        this.storage = parqueoStorage;
        this.init();
    }

    init() {
        this.setupAuthEvents();
        this.checkAuthStatus();
    }

    setupAuthEvents() {
        // Evento para el formulario de login
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'login-form') {
                e.preventDefault();
                this.login();
            }
        });
    }

    login() {
        const usuario = document.getElementById('login-usuario').value;
        const contraseña = document.getElementById('login-contraseña').value;

        const usuarios = this.storage.getUsuarios();
        const usuarioEncontrado = usuarios.find(u => 
            u.usuario === usuario && u.contraseña === contraseña
        );

        if (usuarioEncontrado) {
            this.storage.guardarUsuarioActual(usuarioEncontrado);
            this.mostrarInterfazSegunRol(usuarioEncontrado.rol);
            this.mostrarNotificacion(`✅ Bienvenido, ${usuarioEncontrado.nombre}`, 'success');
        } else {
            this.mostrarNotificacion('❌ Usuario o contraseña incorrectos', 'error');
        }
    }

    logout() {
        this.storage.cerrarSesion();
        this.mostrarLogin();
        this.mostrarNotificacion('👋 Sesión cerrada correctamente', 'info');
    }

    checkAuthStatus() {
        const usuarioActual = this.storage.getUsuarioActual();
        
        if (usuarioActual) {
            this.mostrarInterfazSegunRol(usuarioActual.rol);
        } else {
            this.mostrarLogin();
        }
    }

    mostrarLogin() {
        document.getElementById('app').innerHTML = `
            <div class="login-container" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div style="background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); width: 100%; max-width: 400px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="font-size: 3rem; margin-bottom: 10px;">🏍️</div>
                        <h1 style="margin: 0; color: #333;">UniPark</h1>
                        <p style="color: #666; margin: 10px 0 0 0;">Sistema de Gestión de Parqueo</p>
                    </div>
                    
                    <form id="login-form">
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #333;">Usuario</label>
                            <input type="text" 
                                   id="login-usuario" 
                                   required
                                   style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;"
                                   placeholder="Ingrese su usuario">
                        </div>
                        
                        <div style="margin-bottom: 25px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #333;">Contraseña</label>
                            <input type="password" 
                                   id="login-contraseña" 
                                   required
                                   style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;"
                                   placeholder="Ingrese su contraseña">
                        </div>
                        
                        <button type="submit" 
                                style="width: 100%; padding: 14px; background: #4CAF50; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer;">
                            🚀 Iniciar Sesión
                        </button>
                    </form>
                    
                    <div style="margin-top: 25px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                        <h4 style="margin: 0 0 10px 0; color: #666;">💡 Cuentas de Prueba</h4>
                        <div style="font-size: 14px; color: #666;">
                            <p style="margin: 5px 0;"><strong>Vigilante:</strong> usuario: vigilante, contraseña: 123456</p>
                            <p style="margin: 5px 0;"><strong>Conductor:</strong> usuario: conductor, contraseña: 123456</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    mostrarInterfazSegunRol(rol) {
        const usuarioActual = this.storage.getUsuarioActual();
        
        // Mostrar navbar y app principal
        document.querySelector('.navbar').style.display = 'flex';
        document.querySelector('.footer').style.display = 'block';
        
        // Configurar navegación según rol
        this.configurarNavbarSegunRol(rol, usuarioActual);
        
        // Cargar vista inicial según rol
        if (rol === 'conductor') {
            app.navigateTo('disponibilidad');
        } else {
            app.navigateTo('dashboard');
        }
    }

    configurarNavbarSegunRol(rol, usuario) {
        const navLinks = document.querySelector('.nav-links');
        
        if (rol === 'conductor') {
            navLinks.innerHTML = `
                <button class="nav-link active" data-view="disponibilidad">📊 Disponibilidad</button>
                <button class="nav-link" data-view="mapa-conductor">🗺️ Mapa</button>
                <button class="nav-link" data-view="mi-vehiculo">🚗 Mi Vehículo</button>
            `;
        } else {
            navLinks.innerHTML = `
                <button class="nav-link active" data-view="dashboard">📊 Dashboard</button>
                <button class="nav-link" data-view="mapa">🗺️ Mapa</button>
                <button class="nav-link" data-view="gestion">👮 Gestión</button>
                <button class="nav-link" data-view="busqueda">🔍 Búsqueda</button>
                <button class="nav-link" data-view="admin">⚙️ Admin</button>
            `;
        }
        
        // Agregar información de usuario y logout
        const navInfo = document.querySelector('.nav-info');
        navInfo.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="background: ${rol === 'conductor' ? '#4CAF50' : '#2196F3'}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">
                    ${rol === 'conductor' ? '🚗 Conductor' : '👮 Vigilante'}
                </span>
                <span style="font-weight: bold;">${usuario.nombre}</span>
                <button onclick="auth.logout()" 
                        style="padding: 6px 12px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px;">
                    🚪 Salir
                </button>
            </div>
        `;
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            background: ${tipo === 'success' ? '#4CAF50' : tipo === 'error' ? '#F44336' : '#2196F3'};
        `;
        notification.textContent = mensaje;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Instancia global
const auth = new AuthSystem();
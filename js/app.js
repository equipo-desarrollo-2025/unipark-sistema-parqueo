// js/app.js - VERSIÓN FINAL UNIFICADA CON ROLES
class UniParkApp {
    constructor() {
        this.currentView = 'dashboard';
        this.storage = parqueoStorage;
        this.init();
    }

    init() {
        console.log('🚀 Inicializando UniPark App...');
        
        // Verificar autenticación
        this.verificarAutenticacion();
        
        this.setupEventListeners();
        this.setupStorageListeners();
    }

    verificarAutenticacion() {
        const usuarioActual = this.storage.getUsuarioActual();
        
        if (!usuarioActual) {
            // Si no hay usuario, crear uno por defecto (vigilante)
            const usuarioDefault = {
                id: 'vigilante1',
                nombre: 'Vigilante Principal',
                rol: 'vigilante',
                usuario: 'vigilante'
            };
            this.storage.guardarUsuarioActual(usuarioDefault);
        }
        
        this.configurarInterfazSegunRol();
    }

   configurarInterfazSegunRol() {
    const usuarioActual = this.storage.getUsuarioActual();
    const navLinks = document.querySelector('.nav-links');
    
    if (usuarioActual.rol === 'conductor') {
        navLinks.innerHTML = `
            <button class="nav-link active" data-view="disponibilidad">📊 Disponibilidad</button>
            <button class="nav-link" data-view="mapa-conductor">🗺️ Mapa</button>
            <button onclick="app.cambiarRol()" style="padding: 8px 12px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px;">
                👮 Cambiar a Vigilante
            </button>
        `;
        this.currentView = 'disponibilidad';
    } else {
        // Vigilantes mantienen todas las opciones
        navLinks.innerHTML = `
            <button class="nav-link active" data-view="dashboard">📊 Dashboard</button>
            <button class="nav-link" data-view="mapa">🗺️ Mapa</button>
            <button class="nav-link" data-view="gestion">👮 Gestión</button>
            <button class="nav-link" data-view="busqueda">🔍 Búsqueda</button>
            <button class="nav-link" data-view="admin">⚙️ Admin</button>
            <button onclick="app.cambiarRol()" style="padding: 8px 12px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px;">
                🚗 Cambiar a Conductor
            </button>
        `;
        this.currentView = 'dashboard';
    }
    
    this.actualizarInfoUsuario();
    this.loadView(this.currentView);
}

    actualizarInfoUsuario() {
        const usuarioActual = this.storage.getUsuarioActual();
        const navInfo = document.querySelector('.nav-info');
        
        if (navInfo) {
            navInfo.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="background: ${usuarioActual.rol === 'conductor' ? '#4CAF50' : '#2196F3'}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">
                        ${usuarioActual.rol === 'conductor' ? '🚗 Conductor' : '👮 Vigilante'}
                    </span>
                    <span style="font-weight: bold;">${usuarioActual.nombre}</span>
                </div>
            `;
        }
    }

cambiarRol() {
    const usuarioActual = this.storage.getUsuarioActual();
    const nuevoRol = usuarioActual.rol === 'conductor' ? 'vigilante' : 'conductor';
    
    // Si va a cambiar a VIGILANTE, pedir contraseña
    if (nuevoRol === 'vigilante') {
        const contraseña = prompt('🔐 Acceso a Modo Vigilante\n\nIngrese la contraseña de vigilante:');
        
        // Contraseña por defecto: "vigilante123"
        if (contraseña !== 'ug') {
            this.mostrarNotificacion('❌ Contraseña incorrecta. Acceso denegado.', 'error');
            return;
        }
    }
    
    const nuevoUsuario = {
        ...usuarioActual,
        rol: nuevoRol,
        nombre: nuevoRol === 'conductor' ? 'Conductor Demo' : 'Vigilante Principal'
    };
    
    this.storage.guardarUsuarioActual(nuevoUsuario);
    this.configurarInterfazSegunRol();
    
    this.mostrarNotificacion(
        `🔄 Cambiado a modo ${nuevoRol === 'conductor' ? 'Conductor' : 'Vigilante'}`,
        'success'
    );
}

    setupEventListeners() {
        // Navegación delegada (funciona con elementos dinámicos)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                const view = e.target.dataset.view;
                if (view) {
                    this.navigateTo(view);
                }
            }
        });
    }

    setupStorageListeners() {
        this.storage.onUpdate(() => {
            this.refreshCurrentView();
        });
    }

    navigateTo(view) {
        // Actualizar navegación
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const targetLink = document.querySelector(`[data-view="${view}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
        }
        
        // Cargar vista
        this.currentView = view;
        this.loadView(view);
    }

    loadView(view) {
        const appContainer = document.getElementById('app');
        const usuarioActual = this.storage.getUsuarioActual();
        const esConductor = usuarioActual && usuarioActual.rol === 'conductor';
        
        try {
            let viewHTML = '';
            
            if (esConductor) {
                // VISTAS PARA CONDUCTORES
                switch (view) {
                    case 'disponibilidad':
                        viewHTML = this.loadDisponibilidadView();
                        break;
                    case 'mapa-conductor':
                        viewHTML = this.loadMapaConductorView();
                        break;
                    default:
                        viewHTML = this.loadDisponibilidadView();
                }
            } else {
                // VISTAS PARA VIGILANTES
                switch (view) {
                    case 'dashboard':
                        viewHTML = this.loadDashboardView();
                        break;
                    case 'mapa':
                        viewHTML = this.loadMapaView();
                        break;
                    case 'gestion':
                        viewHTML = this.loadGestionView();
                        break;
                    case 'busqueda':
                        viewHTML = this.loadBusquedaView();
                        break;
                    case 'admin':
                        viewHTML = this.loadAdminView();
                        break;
                    default:
                        viewHTML = this.loadDashboardView();
                }
            }

            appContainer.innerHTML = viewHTML;
            this.setupViewEvents(view);
            
        } catch (error) {
            console.error('Error loading view:', error);
            appContainer.innerHTML = this.getErrorHTML(error.message);
        }
    }

    // ===== VISTAS PARA CONDUCTORES =====


loadDisponibilidadView() {
    const metricas = this.storage.getMetricas();
    const cupos = this.storage.getCupos();
    
    const zonasStats = {};
    ['A', 'B', 'C'].forEach(zona => {
        const cuposZona = cupos.filter(c => c.zona === zona);
        zonasStats[zona] = {
            total: cuposZona.length,
            libres: cuposZona.filter(c => c.estado === 'libre').length,
            ocupados: cuposZona.filter(c => c.estado === 'ocupado').length,
            cupos: cuposZona
        };
    });

    return `
        <div class="view active" id="disponibilidad-view">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1>🏍️ Disponibilidad de Parqueo</h1>
                <p style="color: #666; font-size: 18px;">Estado actual en tiempo real</p>
            </div>
            
            <!-- Estado general -->
            <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 25px; border-radius: 15px; margin-bottom: 25px; text-align: center;">
                <h2 style="margin: 0 0 10px 0;">📊 Estado General</h2>
                <div style="font-size: 3rem; font-weight: bold; margin: 10px 0;">${metricas.disponibles}/${metricas.total}</div>
                <p style="margin: 0; opacity: 0.9;">cupos disponibles</p>
            </div>
            
            <!-- Zonas simplificadas -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 30px;">
                ${['A', 'B', 'C'].map(zona => {
                    const stats = zonasStats[zona];
                    const porcentaje = (stats.libres / stats.total) * 100;
                    let color = '#F44336';
                    let icon = '🔴';
                    let estado = 'Lleno';
                    
                    if (porcentaje >= 60) {
                        color = '#4CAF50';
                        icon = '🟢';
                        estado = 'Disponible';
                    } else if (porcentaje >= 30) {
                        color = '#FF9800';
                        icon = '🟠';
                        estado = 'Medio';
                    }
                    
                    return `
                        <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-left: 5px solid ${color};">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <h3 style="margin: 0; color: ${color};">Zona ${zona}</h3>
                                <span style="font-size: 1.5rem;">${icon}</span>
                            </div>
                            <div style="text-align: center; margin: 20px 0;">
                                <div style="font-size: 2.5rem; font-weight: bold; color: ${color};">
                                    ${stats.libres}/${stats.total}
                                </div>
                                <div style="color: #666; margin-top: 5px;">${estado}</div>
                            </div>
                            <progress value="${stats.libres}" max="${stats.total}" 
                                      style="width: 100%; height: 10px; border-radius: 5px;"></progress>
                            
                            <!-- Botones simplificados -->
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">
                                <button onclick="app.verDetallesZona('${zona}')" 
                                        style="padding: 12px; background: ${color}; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
                                    📊 Ver Detalles
                                </button>
                                <button onclick="app.ocuparCupoConductor('${zona}')" 
                                        style="padding: 12px; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; ${stats.libres === 0 ? 'opacity: 0.5; cursor: not-allowed;' : ''}"
                                        ${stats.libres === 0 ? 'disabled' : ''}>
                                    🅿️ Ocupar Cupo
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            
            <!-- Gráfica visual de cupos -->
            <div style="background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h3 style="margin: 0 0 20px 0; color: #2196F3;">🗺️ Mapa Visual de Cupos</h3>
                ${this.generarMapaVisualCupos(zonasStats)}
            </div>
        </div>
    `;
}

// NUEVA función para ocupar cupo como conductor
ocuparCupoConductor(zona) {
    const placa = prompt(`🏍️ Ocupar cupo en Zona ${zona}\n\nIngrese la placa de su motocicleta (Ej: ABC123):`);
    
    if (!placa) return;
    
    const placaValida = placa.trim().toUpperCase();
    
    // Validar formato básico
    if (!/^[A-Z0-9]{4,6}$/.test(placaValida)) {
        this.mostrarNotificacion('❌ Ingrese una placa válida (4-6 caracteres)', 'error');
        return;
    }
    
    try {
        const cupos = this.storage.getCupos();
        const cupoLibre = cupos.find(cupo => 
            cupo.estado === 'libre' && cupo.zona === zona
        );
        
        if (!cupoLibre) {
            this.mostrarNotificacion(`❌ No hay cupos disponibles en Zona ${zona}`, 'error');
            return;
        }
        
        // Verificar que la placa no esté repetida
        const placaExistente = cupos.find(c => c.placa === placaValida && c.estado === 'ocupado');
        if (placaExistente) {
            this.mostrarNotificacion(`❌ Esta placa ya está ocupando el cupo ${placaExistente.id}`, 'error');
            return;
        }
        
        // Asignar cupo
        cupoLibre.estado = 'ocupado';
        cupoLibre.placa = placaValida;
        cupoLibre.timestamp = new Date().toISOString();
        
        // Historial
        const historial = this.storage.getHistorial();
        historial.push({
            placa: placaValida,
            cupo: cupoLibre.id,
            accion: 'entrada',
            timestamp: cupoLibre.timestamp,
            zona: zona,
            tipo: 'conductor'
        });
        
        this.storage.guardarCupos(cupos);
        this.storage.guardarHistorial(historial);
        
        this.mostrarNotificacion(
            `✅ ¡Cupo ocupado exitosamente!\nZona: ${zona}\nCupo: ${cupoLibre.id}\nPlaca: ${placaValida}`,
            'success'
        );
        
        this.refreshCurrentView();
        
    } catch (error) {
        this.mostrarNotificacion(`❌ Error: ${error.message}`, 'error');
    }
}

// Función para ver detalles de zona
verDetallesZona(zona) {
    const cupos = this.storage.getCupos();
    const cuposZona = cupos.filter(c => c.zona === zona);
    const libres = cuposZona.filter(c => c.estado === 'libre');
    const ocupados = cuposZona.filter(c => c.estado === 'ocupado');
    
    let mensaje = `🏍️ ZONA ${zona} - DETALLE COMPLETO\n\n`;
    mensaje += `📊 Resumen: ${libres.length} libres de ${cuposZona.length} cupos\n\n`;
    
    mensaje += `🟢 CUPOS LIBRES (${libres.length}):\n`;
    libres.forEach((cupo, index) => {
        mensaje += `${index + 1}. ${cupo.id}\n`;
    });
    
    mensaje += `\n🔴 CUPOS OCUPADOS (${ocupados.length}):\n`;
    ocupados.forEach((cupo, index) => {
        mensaje += `${index + 1}. ${cupo.id} - ${cupo.placa}\n`;
    });
    
    mensaje += `\n💡 Para ocupar un cupo, use el botón "🅿️ Ocupar Cupo"`;
    
    alert(mensaje);
}

// Mapa visual mejorado
generarMapaVisualCupos(zonasStats) {
    return `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
            ${['A', 'B', 'C'].map(zona => {
                const stats = zonasStats[zona];
                return `
                    <div style="border: 2px solid #eee; border-radius: 10px; padding: 15px; background: #fafafa;">
                        <h4 style="margin: 0 0 15px 0; text-align: center; color: #333;">Zona ${zona}</h4>
                        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px;">
                            ${stats.cupos.map(cupo => `
                                <div style="width: 100%; aspect-ratio: 1; background: ${cupo.estado === 'libre' ? '#4CAF50' : '#F44336'}; 
                                            border-radius: 6px; display: flex; align-items: center; justify-content: center; 
                                            color: white; font-size: 11px; font-weight: bold; cursor: help; border: 2px solid white;"
                                     title="${cupo.id} - ${cupo.estado === 'libre' ? 'DISPONIBLE' : 'OCUPADO: ' + cupo.placa}">
                                    ${cupo.id.replace('M' + zona, '')}
                                </div>
                            `).join('')}
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-top: 15px; font-size: 12px; padding: 8px; background: white; border-radius: 5px;">
                            <span style="color: #4CAF50;">🟢 ${stats.libres} libres</span>
                            <span style="color: #F44336;">🔴 ${stats.ocupados} ocupados</span>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #1565C0;">
                💡 <strong>Click en cualquier cupo para ver información detallada</strong>
            </p>
        </div>
    `;
}

// Función para calcular duración (simulada)
calcularDuracion(timestampEntrada) {
    const entrada = new Date(timestampEntrada);
    const salida = new Date(entrada.getTime() + (4 * 60 * 60 * 1000)); // +4 horas
    const diffMs = salida - entrada;
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHoras}h ${diffMinutos}m`;
}



// En setupViewEvents, agrega el caso para mi-vehiculo
setupViewEvents(view) {
    switch (view) {
        case 'dashboard':
            this.setupDashboardEvents();
            break;
        case 'gestion':
            this.setupGestionEvents();
            break;
        case 'busqueda':
            this.setupBusquedaEvents();
            break;
    }
}
















    loadMapaConductorView() {
        return `
            <div class="view active" id="mapa-conductor-view">
                <h1>🗺️ Mapa para Conductores</h1>
                <p>Encuentra el mejor lugar para estacionar tu motocicleta</p>
                
                ${this.loadMapaView()}
                
                <!-- Información adicional para conductores -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 20px;">
                    <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 2rem;">🕒</div>
                        <h4 style="margin: 10px 0 5px 0;">Horario</h4>
                        <p style="margin: 0; color: #666;">6:00 AM - 10:00 PM</p>
                    </div>
                    <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 2rem;">💳</div>
                        <h4 style="margin: 10px 0 5px 0;">Costo</h4>
                        <p style="margin: 0; color: #666;">Gratuito estudiantes</p>
                    </div>
                    <div style="background: #fff3e0; padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 2rem;">📞</div>
                        <h4 style="margin: 10px 0 5px 0;">Ayuda</h4>
                        <p style="margin: 0; color: #666;">Contactar vigilante</p>
                    </div>
                </div>
            </div>
        `;
    }

  

    generarRecomendacionAutomatica(zonasStats) {
        const zonas = Object.entries(zonasStats)
            .map(([zona, stats]) => ({
                zona,
                ...stats,
                porcentaje: (stats.libres / stats.total) * 100
            }))
            .sort((a, b) => b.porcentaje - a.porcentaje);
        
        const mejorZona = zonas[0];
        
        if (mejorZona.porcentaje === 0) {
            return `<p>❌ <strong>No hay cupos disponibles</strong> en este momento. Considera llegar más temprano o usar transporte alternativo.</p>`;
        }
        
        if (mejorZona.porcentaje >= 60) {
            return `<p>✅ <strong>Zona ${mejorZona.zona} recomendada</strong> - ${mejorZona.libres} cupos disponibles (${mejorZona.porcentaje.toFixed(0)}% disponible). ¡Llegada ideal!</p>`;
        }
        
        if (mejorZona.porcentaje >= 30) {
            return `<p>⚠️ <strong>Zona ${mejorZona.zona} sugerida</strong> - ${mejorZona.libres} cupos disponibles (${mejorZona.porcentaje.toFixed(0)}% disponible). Apresúrate, se llena rápido.</p>`;
        }
        
        return `<p>🔴 <strong>Zona ${mejorZona.zona} disponible</strong> - Solo ${mejorZona.libres} cupos (${mejorZona.porcentaje.toFixed(0)}% disponible). Últimos cupos.</p>`;
    }

    mostrarRecomendacion(zona) {
        const cupos = this.storage.getCupos();
        const cuposZona = cupos.filter(c => c.zona === zona);
        const libres = cuposZona.filter(c => c.estado === 'libre').length;
        const total = cuposZona.length;
        const porcentaje = (libres / total) * 100;
        
        let mensaje = `Zona ${zona}\n\n`;
        mensaje += `🏍️ Cupos disponibles: ${libres}/${total}\n`;
        mensaje += `📊 Ocupación: ${porcentaje.toFixed(0)}%\n\n`;
        
        if (porcentaje >= 60) {
            mensaje += `💡 Recomendación: Excelente disponibilidad. Puedes llegar con tranquilidad.`;
        } else if (porcentaje >= 30) {
            mensaje += `💡 Recomendación: Disponibilidad media. Te conviene llegar pronto.`;
        } else {
            mensaje += `💡 Recomendación: Baja disponibilidad. Considera otra zona o horario.`;
        }
        
        alert(mensaje);
    }

    // ===== VISTAS PARA VIGILANTES =====

    loadDashboardView() {
        const metricas = this.storage.getMetricas();
        const cupos = this.storage.getCupos();
        
        const porcentaje = isNaN(metricas.porcentajeOcupacion) ? '0' : metricas.porcentajeOcupacion;
        
        return `
            <div class="view active" id="dashboard-view">
                <h1>📊 Dashboard en Tiempo Real</h1>
                
                <div class="metrics-grid">
                    <div class="metric-card total">
                        <h3>Total Cupos</h3>
                        <div class="metric-value">${metricas.total}</div>
                        <p>Capacidad total del parqueadero</p>
                    </div>
                    
                    <div class="metric-card disponible">
                        <h3>Disponibles</h3>
                        <div class="metric-value">${metricas.disponibles}</div>
                        <p>Cupos libres para uso</p>
                    </div>
                    
                    <div class="metric-card ocupado">
                        <h3>Ocupados</h3>
                        <div class="metric-value">${metricas.ocupados}</div>
                        <p>${porcentaje}% de ocupación</p>
                    </div>
                </div>
                
                <div class="section">
                    <h2>🏍️ Estado de Cupos</h2>
                    <div class="cupos-grid" id="cupos-grid">
                        ${this.generateCuposHTML(cupos)}
                    </div>
                </div>
                
                <div class="section">
                    <h2>📈 Estadísticas por Zona</h2>
                    <div id="zonas-stats">
                        ${this.generateZonasStats()}
                    </div>
                </div>
            </div>
        `;
    }

    generateCuposHTML(cupos) {
        return cupos.map(cupo => `
            <div class="cupo ${cupo.estado}" 
                 data-cupo-id="${cupo.id}"
                 title="${cupo.id} - ${cupo.estado.toUpperCase()}${cupo.placa ? ' - ' + cupo.placa : ''}">
                ${cupo.id.replace('M', '')}
            </div>
        `).join('');
    }

    generateZonasStats() {
        const cupos = this.storage.getCupos();
        const zonas = {};
        
        cupos.forEach(cupo => {
            if (!zonas[cupo.zona]) {
                zonas[cupo.zona] = { total: 0, ocupados: 0 };
            }
            zonas[cupo.zona].total++;
            if (cupo.estado === 'ocupado') zonas[cupo.zona].ocupados++;
        });
        
        return Object.entries(zonas).map(([zona, stats]) => `
            <div class="zona-stat" style="margin: 10px 0; padding: 10px; background: white; border-radius: 8px;">
                <h4 style="margin: 0 0 5px 0;">Zona ${zona}</h4>
                <p style="margin: 0 0 5px 0;">${stats.ocupados}/${stats.total} ocupados</p>
                <progress value="${stats.ocupados}" max="${stats.total}" style="width: 100%;"></progress>
            </div>
        `).join('');
    }

    loadMapaView() {
        return `
            <div class="view active" id="mapa-view">
                <h1>🗺️ Mapa en Tiempo Real</h1>
                <p>Visualiza la ocupación del parqueadero en el campus universitario</p>
                
                <div id="map-container" style="background: #f0f8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="text-align: center; margin-bottom: 20px;">🗺️ Mapa Interactivo del Campus</h3>
                    
                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
                        <!-- Mapa SVG -->
                        <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
                            <svg width="100%" height="300" viewBox="0 0 400 300" style="border: 2px solid #ddd; border-radius: 8px;">
                                <!-- Edificios -->
                                <rect x="50" y="50" width="100" height="80" fill="#bbdefb" stroke="#2196F3" onclick="app.seleccionarZona('A')" style="cursor: pointer;"/>
                                <rect x="200" y="100" width="120" height="60" fill="#ffcdd2" stroke="#F44336" onclick="app.seleccionarZona('B')" style="cursor: pointer;"/>
                                <rect x="100" y="180" width="80" height="70" fill="#c8e6c9" stroke="#4CAF50" onclick="app.seleccionarZona('C')" style="cursor: pointer;"/>
                                
                                <!-- Zonas de parqueo -->
                                <circle cx="80" cy="60" r="15" fill="#4CAF50" stroke="white" stroke-width="2" onclick="app.seleccionarZona('A')" style="cursor: pointer;"/>
                                <circle cx="250" cy="120" r="15" fill="#FF9800" stroke="white" stroke-width="2" onclick="app.seleccionarZona('B')" style="cursor: pointer;"/>
                                <circle cx="140" cy="200" r="15" fill="#F44336" stroke="white" stroke-width="2" onclick="app.seleccionarZona('C')" style="cursor: pointer;"/>
                                
                                <!-- Labels -->
                                <text x="80" y="60" text-anchor="middle" fill="white" font-weight="bold" font-size="12" pointer-events="none">A</text>
                                <text x="250" y="120" text-anchor="middle" fill="white" font-weight="bold" font-size="12" pointer-events="none">B</text>
                                <text x="140" y="200" text-anchor="middle" fill="white" font-weight="bold" font-size="12" pointer-events="none">C</text>
                                
                                <!-- Leyenda visual -->
                                <text x="50" y="280" fill="#666" font-size="10">🏢 Edificios Universitarios</text>
                                <text x="200" y="280" fill="#666" font-size="10">🟢 Zonas de Parqueo</text>
                            </svg>
                            
                            <div style="margin-top: 15px;">
                                <p><strong>💡 Click en cualquier zona de parqueo para ver detalles</strong></p>
                            </div>
                        </div>
                        
                        <!-- Panel de información -->
                        <div style="background: white; padding: 20px; border-radius: 8px;">
                            <h4 style="margin-top: 0;">📊 Estado de Zonas</h4>
                            <div id="info-zona">
                                <p style="color: #666; text-align: center;">Selecciona una zona en el mapa</p>
                            </div>
                            
                            <div style="margin-top: 20px;">
                                <h5>🎨 Leyenda</h5>
                                <div style="display: flex; align-items: center; gap: 10px; margin: 8px 0;">
                                    <div style="width: 15px; height: 15px; background: #4CAF50; border-radius: 50%;"></div>
                                    <span>Alta disponibilidad</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 10px; margin: 8px 0;">
                                    <div style="width: 15px; height: 15px; background: #FF9800; border-radius: 50%;"></div>
                                    <span>Disponibilidad media</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 10px; margin: 8px 0;">
                                    <div style="width: 15px; height: 15px; background: #F44336; border-radius: 50%;"></div>
                                    <span>Baja disponibilidad</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <button onclick="app.mostrarDetallesZonas()" 
                            style="padding: 12px 24px; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; margin: 0 10px;">
                        📋 Ver Detalles Completos
                    </button>
                    <button onclick="app.navigateTo('dashboard')" 
                            style="padding: 12px 24px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; margin: 0 10px;">
                        📊 Ir al Dashboard
                    </button>
                </div>
            </div>
        `;
    }

    seleccionarZona(zona) {
        // Obtener datos REALES del localStorage
        const cupos = this.storage.getCupos();
        
        // Filtrar cupos por zona
        const cuposZona = cupos.filter(cupo => cupo.zona === zona);
        const totalCupos = cuposZona.length;
        const cuposLibres = cuposZona.filter(cupo => cupo.estado === 'libre').length;
        const cuposOcupados = cuposZona.filter(cupo => cupo.estado === 'ocupado').length;
        
        const porcentaje = totalCupos > 0 ? (cuposLibres / totalCupos) * 100 : 0;
        
        // Determinar color según disponibilidad
        let color = "#F44336"; // Rojo por defecto
        if (porcentaje >= 60) {
            color = "#4CAF50"; // Verde
        } else if (porcentaje >= 30) {
            color = "#FF9800"; // Naranja
        }
        
        // Información de las zonas
        const infoZonas = {
            'A': { 
                nombre: "Zona A - Norte", 
                edificio: "Edificio Principal",
                descripcion: "Zona cercana a la entrada principal, ideal para acceso rápido a aulas."
            },
            'B': { 
                nombre: "Zona B - Centro", 
                edificio: "Biblioteca",
                descripcion: "Zona central, perfecta para estudiantes que van a la biblioteca."
            },
            'C': { 
                nombre: "Zona C - Sur", 
                edificio: "Comedor Universitario",
                descripcion: "Zona cerca del comedor, conveniente para horarios de almuerzo."
            }
        };
        
        const data = infoZonas[zona];
        
        // Mostrar información ACTUALIZADA
        document.getElementById('info-zona').innerHTML = `
            <div style="background: ${color}20; padding: 15px; border-radius: 8px; border-left: 4px solid ${color};">
                <h4 style="margin: 0 0 10px 0; color: ${color};">${data.nombre}</h4>
                <p style="margin: 5px 0;"><strong>🏢 Edificio:</strong> ${data.edificio}</p>
                <p style="margin: 5px 0;"><strong>🏍️ Cupos totales:</strong> ${totalCupos}</p>
                <p style="margin: 5px 0;"><strong>✅ Libres:</strong> ${cuposLibres}</p>
                <p style="margin: 5px 0;"><strong>❌ Ocupados:</strong> ${cuposOcupados}</p>
                <p style="margin: 5px 0;"><strong>📊 Disponibilidad:</strong> ${porcentaje.toFixed(1)}%</p>
                <progress value="${cuposLibres}" max="${totalCupos}" style="width: 100%; height: 10px;"></progress>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">${data.descripcion}</p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">
                    <button onclick="app.asignarCupoAutomatico('${zona}')" 
                            style="padding: 10px; background: ${color}; color: white; border: none; border-radius: 5px; cursor: pointer; ${cuposLibres === 0 ? 'opacity: 0.5; cursor: not-allowed;' : ''}"
                            ${cuposLibres === 0 ? 'disabled' : ''}>
                        ${cuposLibres === 0 ? '❌ Sin cupos' : '🚀 Asignar Cupo'}
                    </button>
                    <button onclick="app.navigateTo('gestion')" 
                            style="padding: 10px; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        👮 Gestión Completa
                    </button>
                </div>
                
                ${cuposOcupados > 0 ? `
                    <div style="margin-top: 15px; padding: 10px; background: #fff3cd; border-radius: 5px;">
                        <strong>📋 Motos en esta zona:</strong>
                        <div style="font-size: 12px; margin-top: 5px;">
                            ${cuposZona.filter(c => c.estado === 'ocupado')
                                .map(cupo => `• ${cupo.placa} (${cupo.id})`)
                                .join('<br>')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Actualizar también el color del marcador en el mapa
        this.actualizarColorMarcador(zona, color);
    }

// En asignarCupoAutomatico() 
asignarCupoAutomatico(zona) {
    const placa = prompt(`🏍️ Asignar cupo en Zona ${zona}\n\nIngrese la placa de la motocicleta (Ej: ABC123):`);
    
    if (!placa) return;
    
    const placaValida = placa.trim().toUpperCase();
    
    // Validación básica
    if (!/^[A-Z0-9]{4,6}$/.test(placaValida)) {
        this.mostrarNotificacion('❌ Ingrese una placa válida', 'error');
        return;
    }
    
    try {
        const cupos = this.storage.getCupos();
        const cupoLibre = cupos.find(cupo => 
            cupo.estado === 'libre' && cupo.zona === zona
        );
        
        if (!cupoLibre) {
            this.mostrarNotificacion(`❌ No hay cupos disponibles en Zona ${zona}`, 'error');
            return;
        }
        
        // Verificar placa única
        const placaExistente = cupos.find(c => c.placa === placaValida && c.estado === 'ocupado');
        if (placaExistente) {
            this.mostrarNotificacion(`❌ Esta placa ya está en cupo ${placaExistente.id}`, 'error');
            return;
        }
        
        // Asignar
        cupoLibre.estado = 'ocupado';
        cupoLibre.placa = placaValida;
        cupoLibre.timestamp = new Date().toISOString();
        
        const historial = this.storage.getHistorial();
        historial.push({
            placa: placaValida,
            cupo: cupoLibre.id,
            accion: 'entrada',
            timestamp: cupoLibre.timestamp,
            zona: zona,
            tipo: 'vigilante'
        });
        
        this.storage.guardarCupos(cupos);
        this.storage.guardarHistorial(historial);
        
        this.mostrarNotificacion(
            `✅ Entrada registrada\nZona ${zona} - Cupo ${cupoLibre.id}\nPlaca: ${placaValida}`,
            'success'
        );
        
        this.refreshCurrentView();
        
    } catch (error) {
        this.mostrarNotificacion(`❌ Error: ${error.message}`, 'error');
    }
}

    actualizarColorMarcador(zona, color) {
        // Esta función puede expandirse para cambiar colores en el SVG
        console.log(`Actualizando zona ${zona} a color ${color}`);
        // En una versión avanzada, aquí cambiarías el SVG dinámicamente
    }

    mostrarDetallesZonas() {
        const metricas = this.storage.getMetricas();
        
        alert(`🗺️ Mapa del Campus UniPark

ZONA A (🟢 Verde):
• Ubicación: Norte del campus
• Cupos: 15/20 disponibles (75%)
• Cerca de: Edificio Principal
• Ideal para: Clases matutinas

ZONA B (🟠 Naranja):
• Ubicación: Centro del campus  
• Cupos: 10/20 disponibles (50%)
• Cerca de: Biblioteca
• Ideal para: Estudio e investigación

ZONA C (🔴 Rojo):
• Ubicación: Sur del campus
• Cupos: 5/20 disponibles (25%)
• Cerca de: Comedor Universitario
• Ideal para: Horario de almuerzo

ESTADO GENERAL:
• Total cupos: ${metricas.total}
• Disponibles: ${metricas.disponibles}
• Ocupados: ${metricas.ocupados}
• Ocupación: ${metricas.porcentajeOcupacion}%

💡 El sistema se actualiza en tiempo real`);
    }

    loadGestionView() {
        return `
            <div class="view active" id="gestion-view">
                <h1>👮 Gestión de Vigilantes</h1>
                
                <div class="management-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 2rem 0;">
                    <div class="management-card" style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h2 style="color: #4CAF50; margin-bottom: 1rem;">🚀 Registrar Entrada</h2>
                        <div class="form-group">
                            <label class="form-label">Placa de la Motocicleta:</label>
                            <input type="text" 
                                   id="placa-entrada" 
                                   class="form-input" 
                                   placeholder="Ej: ABC123"
                                   maxlength="6"
                                   style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 5px; margin: 10px 0;"
                                   required>
                        </div>
                        <button id="btn-registrar-entrada" 
                                style="padding: 12px 24px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; width: 100%;">
                            ✅ Registrar Entrada
                        </button>
                    </div>
                    
                    <div class="management-card" style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h2 style="color: #F44336; margin-bottom: 1rem;">🛑 Registrar Salida</h2>
                        <div class="form-group">
                            <label class="form-label">Placa de la Motocicleta:</label>
                            <input type="text" 
                                   id="placa-salida" 
                                   class="form-input" 
                                   placeholder="Ej: ABC123"
                                   maxlength="6"
                                   style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 5px; margin: 10px 0;"
                                   required>
                        </div>
                        <button id="btn-registrar-salida" 
                                style="padding: 12px 24px; background: #F44336; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; width: 100%;">
                            🚪 Registrar Salida
                        </button>
                    </div>
                </div>
                
                <div id="gestion-stats" style="background: white; padding: 1rem; border-radius: 8px; margin-top: 2rem;">
                    <h3>📊 Estado Actual</h3>
                    ${this.generateEstadoActual()}
                </div>
            </div>
        `;
    }
  loadBusquedaView() {
    return `
        <div class="view active" id="busqueda-view">
            <h1>🔍 Búsqueda y Gestión</h1>
            <p>Sistema flexible para diferentes tipos de vehículos</p>
            
            <!-- Panel de búsqueda mejorado -->
            <div style="background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 20px 0;">
                <h3 style="margin: 0 0 20px 0; color: #2196F3;">🔎 Buscar Vehículo</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 15px; align-items: end;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold;">Tipo de Búsqueda:</label>
                        <select id="tipo-busqueda" style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;">
                            <option value="placa">📋 Por Placa</option>
                            <option value="codigo">🔢 Por Código</option>
                            <option value="descripcion">📝 Por Descripción</option>
                            <option value="cupo">🅿️ Por Cupo</option>
                        </select>
                    </div>
                    
                    <div>
                        <label id="label-busqueda" style="display: block; margin-bottom: 8px; font-weight: bold;">Placa del Vehículo:</label>
                        <div style="display: flex; gap: 10px;">
                            <input type="text" 
                                   id="valor-busqueda" 
                                   style="flex: 1; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;"
                                   placeholder="Ej: ABC123"
                                   maxlength="20">
                            <button id="btn-buscar" 
                                    style="padding: 12px 24px; background: #2196F3; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
                                🔍 Buscar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Resultados y acciones -->
            <div id="resultado-busqueda">
                <!-- Se llena dinámicamente -->
            </div>
            
            <!-- Panel de acciones rápidas -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #666;">⚡ Acciones Rápidas</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <button onclick="app.registrarEntradaRapida()" 
                            style="padding: 15px; background: #4CAF50; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; text-align: center;">
                        🟢 Registrar Entrada
                    </button>
                    <button onclick="app.registrarSalidaRapida()" 
                            style="padding: 15px; background: #F44336; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; text-align: center;">
                        🔴 Registrar Salida
                    </button>
                    <button onclick="app.verReporteOcupacion()" 
                            style="padding: 15px; background: #FF9800; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; text-align: center;">
                        📊 Ver Ocupación
                    </button>
                </div>
            </div>
        </div>


         



    `;
}



// NUEVAS funciones de búsqueda mejorada

// Funciones auxiliares para la búsqueda mejorada - AGREGAR ESTAS
// En app.js - MEJORAR las funciones de registro:

registrarEntradaRapida() {
    try {
        const tipo = prompt(`🚀 Registrar Entrada Rápida\n\nIngrese tipo de vehículo:\n- motocicleta\n- bicicleta\n- patineta\n- carro`);
        
        if (!tipo) return;
        
        const tipoInfo = this.storage.getTiposVehiculo()[tipo.toLowerCase()];
        if (!tipoInfo) {
            this.mostrarNotificacion('❌ Tipo de vehículo no válido', 'error');
            return;
        }
        
        let identificador;
        if (tipoInfo.requierePlaca) {
            identificador = prompt(`Ingrese placa para ${tipo}:`);
        } else {
            identificador = prompt(`Ingrese código/descripción para ${tipo}:`);
        }
        
        if (!identificador) return;
        
        this.procesarEntrada(tipo.toLowerCase(), identificador.toUpperCase());
    } catch (error) {
        console.error('Error en registrarEntradaRapida:', error);
        this.mostrarNotificacion('❌ Error al registrar entrada', 'error');
    }
}

procesarEntrada(tipoVehiculo, identificador) {
    try {
        const cupos = this.storage.getCupos();
        const cupoLibre = cupos.find(cupo => cupo.estado === 'libre');
        
        if (!cupoLibre) {
            this.mostrarNotificacion('❌ No hay cupos disponibles', 'error');
            return;
        }
        
        // Verificar que no esté repetido
        const existe = cupos.find(c => 
            c.placa === identificador && c.estado === 'ocupado'
        );
        
        if (existe) {
            this.mostrarNotificacion(`❌ Este vehículo ya está en cupo ${existe.id}`, 'error');
            return;
        }
        
        // Asignar cupo
        cupoLibre.estado = 'ocupado';
        cupoLibre.placa = identificador;
        cupoLibre.timestamp = new Date().toISOString();
        
        // Historial
        const historial = this.storage.getHistorial();
        historial.push({
            placa: identificador,
            cupo: cupoLibre.id,
            accion: 'entrada',
            timestamp: cupoLibre.timestamp,
            zona: cupoLibre.zona,
            tipo: 'rapido'
        });
        
        this.storage.guardarCupos(cupos);
        this.storage.guardarHistorial(historial);
        
        // Disparar evento manualmente si es necesario
        this.storage.dispatchStorageEvent();
        
        this.mostrarNotificacion(
            `✅ ${tipoVehiculo.toUpperCase()} registrado\nCupo: ${cupoLibre.id}\nID: ${identificador}`,
            'success'
        );
        
        this.refreshCurrentView();
        
    } catch (error) {
        console.error('Error en procesarEntrada:', error);
        this.mostrarNotificacion(`❌ Error: ${error.message}`, 'error');
    }
}

registrarSalidaRapida() {
    try {
        const identificador = prompt(`🔴 Registrar Salida\n\nIngrese placa, código o número de cupo:`);
        
        if (!identificador) return;
        
        const cupos = this.storage.getCupos();
        const cupoOcupado = cupos.find(cupo => 
            (cupo.placa === identificador.toUpperCase() || cupo.id === identificador.toUpperCase()) && 
            cupo.estado === 'ocupado'
        );
        
        if (!cupoOcupado) {
            this.mostrarNotificacion('❌ No se encontró el vehículo en el parqueadero', 'error');
            return;
        }

        // Historial de salida
        const historial = this.storage.getHistorial();
        historial.push({
            placa: cupoOcupado.placa,
            cupo: cupoOcupado.id,
            accion: 'salida',
            timestamp: new Date().toISOString(),
            zona: cupoOcupado.zona,
            tipo: 'rapido'
        });

        // Liberar cupo
        cupoOcupado.estado = 'libre';
        cupoOcupado.placa = null;
        cupoOcupado.timestamp = null;

        this.storage.guardarCupos(cupos);
        this.storage.guardarHistorial(historial);
        
        // Disparar evento manualmente
        this.storage.dispatchStorageEvent();
        
        // Calcular tiempo
        const entrada = new Date(cupoOcupado.timestamp);
        const salida = new Date();
        const diffMs = salida - entrada;
        const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        this.mostrarNotificacion(
            `✅ Salida registrada\nCupo: ${cupoOcupado.id} liberado\n⏱️ Tiempo: ${diffHoras}h ${diffMinutos}m`,
            'success'
        );
        
        this.refreshCurrentView();
        
    } catch (error) {
        console.error('Error en registrarSalidaRapida:', error);
        this.mostrarNotificacion(`❌ Error: ${error.message}`, 'error');
    }
}

registrarSalidaRapidaDesdeResultado(identificador) {
    document.getElementById('valor-busqueda').value = identificador;
    this.registrarSalidaRapida();
}

registrarEntradaEnCupo(cupoId) {
    const tipo = prompt(`🟢 Ocupar cupo ${cupoId}\n\nIngrese tipo de vehículo:\n- motocicleta\n- bicicleta\n- patineta\n- carro`);
    if (!tipo) return;
    
    this.registrarEntradaConTipoEnCupo(tipo, cupoId);
}

registrarEntradaConTipoEnCupo(tipoVehiculo, cupoId) {
    const tipoInfo = this.storage.getTiposVehiculo()[tipoVehiculo];
    if (!tipoInfo) {
        this.mostrarNotificacion('❌ Tipo de vehículo no válido', 'error');
        return;
    }
    
    let identificador;
    if (tipoInfo.requierePlaca) {
        identificador = prompt(`Ingrese placa para ${tipoVehiculo}:`);
    } else {
        identificador = prompt(`Ingrese código/descripción para ${tipoVehiculo}:`);
    }
    
    if (!identificador) return;
    
    try {
        const cupos = this.storage.getCupos();
        const cupo = cupos.find(c => c.id === cupoId);
        
        if (!cupo) {
            this.mostrarNotificacion('❌ Cupo no encontrado', 'error');
            return;
        }
        
        if (cupo.estado === 'ocupado') {
            this.mostrarNotificacion('❌ El cupo ya está ocupado', 'error');
            return;
        }
        
        // Verificar que no esté repetido
        const existe = cupos.find(c => 
            c.placa === identificador.toUpperCase() && c.estado === 'ocupado'
        );
        
        if (existe) {
            this.mostrarNotificacion(`❌ Este vehículo ya está en cupo ${existe.id}`, 'error');
            return;
        }
        
        // Asignar cupo específico
        cupo.estado = 'ocupado';
        cupo.placa = identificador.toUpperCase();
        cupo.timestamp = new Date().toISOString();
        
        // Historial
        const historial = this.storage.getHistorial();
        historial.push({
            placa: identificador.toUpperCase(),
            cupo: cupoId,
            accion: 'entrada',
            timestamp: cupo.timestamp,
            zona: cupo.zona,
            tipo: 'cupo-especifico'
        });
        
        this.storage.guardarCupos(cupos);
        this.storage.guardarHistorial(historial);
        
        this.mostrarNotificacion(`✅ ${tipoVehiculo} registrado en ${cupoId}`, 'success');
        this.refreshCurrentView();
    } catch (error) {
        this.mostrarNotificacion(`❌ Error: ${error.message}`, 'error');
    }
}

verMasInformacion(cupoId) {
    const cupos = this.storage.getCupos();
    const cupo = cupos.find(c => c.id === cupoId);
    
    if (cupo) {
        let info = `📊 Información del Cupo ${cupoId}\n\n`;
        info += `📍 Zona: ${cupo.zona}\n`;
        info += `📝 Estado: ${cupo.estado.toUpperCase()}\n`;
        
        if (cupo.estado === 'ocupado') {
            const entrada = new Date(cupo.timestamp);
            const ahora = new Date();
            const diffMs = ahora - entrada;
            const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            
            info += `🏍️ Vehículo: ${cupo.placa}\n`;
            info += `🕒 Hora entrada: ${entrada.toLocaleString()}\n`;
            info += `⏱️ Tiempo estacionado: ${diffHoras}h ${diffMinutos}m\n`;
            
            const vehiculo = this.storage.inferirTipoVehiculo(cupo.placa);
            info += `🚙 Tipo: ${vehiculo.tipo} ${vehiculo.icon}`;
        } else {
            info += `✅ DISPONIBLE para estacionar`;
        }
        
        alert(info);
    }
}

verReporteOcupacion() {
    const metricas = this.storage.getMetricas();
    const cupos = this.storage.getCupos();
    
    let reporte = `📊 REPORTE DE OCUPACIÓN\n\n`;
    reporte += `🏍️ Total cupos: ${metricas.total}\n`;
    reporte += `🟢 Disponibles: ${metricas.disponibles}\n`;
    reporte += `🔴 Ocupados: ${metricas.ocupados}\n`;
    reporte += `📈 Ocupación: ${metricas.porcentajeOcupacion}%\n\n`;
    
    // Por zonas
    reporte += `📍 POR ZONAS:\n`;
    ['A', 'B', 'C'].forEach(zona => {
        const cuposZona = cupos.filter(c => c.zona === zona);
        const libres = cuposZona.filter(c => c.estado === 'libre').length;
        const ocupados = cuposZona.filter(c => c.estado === 'ocupado').length;
        reporte += `Zona ${zona}: ${libres}/${cuposZona.length} libres\n`;
    });
    
    alert(reporte);
}

registrarEntradaConBusqueda(tipo, valor) {
    // Implementación simple - redirigir a entrada rápida
    document.getElementById('tipo-busqueda').value = 'placa';
    document.getElementById('valor-busqueda').value = valor;
    this.registrarEntradaRapida();
}











setupBusquedaEvents() {
    // Cambiar placeholder según tipo de búsqueda
    document.getElementById('tipo-busqueda').addEventListener('change', (e) => {
        this.actualizarPlaceholderBusqueda(e.target.value);
    });
    
    // Buscar
    document.getElementById('btn-buscar').addEventListener('click', () => {
        this.buscarVehiculoMejorado();
    });
    
    // Enter para buscar
    document.getElementById('valor-busqueda').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.buscarVehiculoMejorado();
    });
}

actualizarPlaceholderBusqueda(tipo) {
    const input = document.getElementById('valor-busqueda');
    const label = document.getElementById('label-busqueda');
    
    const config = {
        'placa': { label: 'Placa del Vehículo:', placeholder: 'Ej: ABC123, MTP2024' },
        'codigo': { label: 'Código del Vehículo:', placeholder: 'Ej: BICI-001, PATIN-2024' },
        'descripcion': { label: 'Descripción:', placeholder: 'Ej: Bicicleta roja, Patineta azul' },
        'cupo': { label: 'Número de Cupo:', placeholder: 'Ej: MA01, MB15, MC20' }
    };
    
    label.textContent = config[tipo].label;
    input.placeholder = config[tipo].placeholder;
}

buscarVehiculoMejorado() {
    const tipo = document.getElementById('tipo-busqueda').value;
    const valor = document.getElementById('valor-busqueda').value.trim();
    const resultadoDiv = document.getElementById('resultado-busqueda');
    
    if (!valor) {
        this.mostrarNotificacion('❌ Ingrese un valor para buscar', 'error');
        return;
    }
    
    const resultados = this.storage.buscarVehiculoCompleto(tipo, valor);
    
    if (resultados.encontrado) {
        resultadoDiv.innerHTML = this.generarHTMLResultado(resultados);
    } else {
        resultadoDiv.innerHTML = `
            <div style="background: #ffebee; padding: 20px; border-radius: 8px; margin-top: 15px; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 10px;">🔍</div>
                <h4 style="color: #c62828; margin: 0 0 10px 0;">Vehículo no encontrado</h4>
                <p style="color: #666; margin: 0;">No se encontró "${valor}" en el sistema</p>
                <button onclick="app.registrarEntradaConBusqueda('${tipo}', '${valor}')" 
                        style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 15px;">
                    🟢 Registrar como nueva entrada
                </button>
            </div>
        `;
    }
}


generarHTMLResultado(resultados) {
    const { encontrado, tipo, datos, vehiculo } = resultados;
    
    if (tipo === 'ocupado') {
        const entrada = new Date(datos.timestamp);
        const ahora = new Date();
        const diffMs = ahora - entrada;
        const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        return `
            <div style="background: #e8f5e8; padding: 25px; border-radius: 10px; margin-top: 15px;">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                    <div style="font-size: 3rem;">${vehiculo.icon}</div>
                    <div>
                        <h4 style="margin: 0 0 5px 0; color: #2e7d32;">✅ Vehículo Encontrado</h4>
                        <p style="margin: 0; color: #666;">${vehiculo.tipo.toUpperCase()} - Cupo ${datos.id}</p>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div style="background: white; padding: 15px; border-radius: 8px;">
                        <strong>📋 Identificación:</strong><br>
                        ${datos.placa ? `Placa: ${datos.placa}` : `Código: ${datos.codigo}`}
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 8px;">
                        <strong>🅿️ Ubicación:</strong><br>
                        Zona ${datos.zona} - ${datos.id}
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 8px;">
                        <strong>🕒 Hora Entrada:</strong><br>
                        ${entrada.toLocaleString()}
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 8px;">
                        <strong>⏱️ Tiempo:</strong><br>
                        ${diffHoras}h ${diffMinutos}m
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <button onclick="app.registrarSalidaRapidaDesdeResultado('${datos.placa || datos.codigo}')" 
                            style="padding: 12px; background: #F44336; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
                        🔴 Registrar Salida
                    </button>
                    <button onclick="app.verMasInformacion('${datos.id}')" 
                            style="padding: 12px; background: #2196F3; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
                        📊 Más Información
                    </button>
                </div>
            </div>
        `;
    } else if (tipo === 'libre') {
        return `
            <div style="background: #e3f2fd; padding: 25px; border-radius: 10px; margin-top: 15px; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 10px;">🅿️</div>
                <h4 style="color: #1565C0; margin: 0 0 10px 0;">Cupo Disponible</h4>
                <p style="color: #666; margin: 0 0 20px 0;">El cupo ${datos.id} está libre</p>
                <button onclick="app.registrarEntradaEnCupo('${datos.id}')" 
                        style="padding: 12px 24px; background: #4CAF50; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
                    🟢 Ocupar este Cupo
                </button>
            </div>
        `;
    }
}






    loadAdminView() {
        const metricas = this.storage.getMetricas();
        
        return `
            <div class="view active" id="admin-view">
                <h1>⚙️ Panel de Administración</h1>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                    <div style="background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center;">
                        <div style="font-size: 3rem; margin-bottom: 15px;">🔄</div>
                        <h3 style="margin: 0 0 15px 0; color: #FF9800;">Reset de Datos</h3>
                        <p style="color: #666; margin-bottom: 20px;">Reinicia todos los datos a estado inicial</p>
                        <button onclick="app.reiniciarDatos()" 
                                style="padding: 12px 24px; background: #FF9800; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; width: 100%;">
                            🔄 Reiniciar Sistema
                        </button>
                    </div>
                    
                    <div style="background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h3 style="margin: 0 0 15px 0; color: #2196F3;">📈 Estadísticas</h3>
                        <div>
                            <p style="margin: 8px 0;"><strong>Total Cupos:</strong> ${metricas.total}</p>
                            <p style="margin: 8px 0;"><strong>Disponibles:</strong> ${metricas.disponibles}</p>
                            <p style="margin: 8px 0;"><strong>Ocupados:</strong> ${metricas.ocupados}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    reiniciarDatos() {
        if (confirm('¿Estás seguro de que quieres REINICIAR todos los datos del parqueadero?\n\nSe borrarán todas las placas y se dejarán 45 cupos libres de 60.')) {
            const cuposIniciales = this.generarCuposSoloLibres();
            this.storage.guardarCupos(cuposIniciales);
            this.storage.guardarHistorial([]);
            
            this.mostrarNotificacion('✅ Datos reiniciados - 45/60 cupos libres', 'success');
            this.refreshCurrentView();
        }
    }

    generarCuposSoloLibres() {
        const zonas = ['A', 'B', 'C'];
        const cupos = [];
        
        zonas.forEach(zona => {
            for (let i = 1; i <= 20; i++) {
                cupos.push({
                    id: `M${zona}${i.toString().padStart(2, '0')}`,
                    zona: zona,
                    estado: 'libre', // ¡TODOS LIBRES!
                    placa: null,
                    timestamp: null,
                    tipo: i <= 15 ? 'normal' : 'preferencial'
                });
            }
        });
        
        return cupos;
    }

    setupViewEvents(view) {
        switch (view) {
            case 'dashboard':
                this.setupDashboardEvents();
                break;
            case 'gestion':
                this.setupGestionEvents();
                break;
            case 'busqueda':
                this.setupBusquedaEvents();
                break;
        }
    }

    setupDashboardEvents() {
        // Click en cupos
        document.querySelectorAll('.cupo').forEach(cupo => {
            cupo.addEventListener('click', (e) => {
                const cupoId = e.target.dataset.cupoId;
                this.mostrarDetalleCupo(cupoId);
            });
        });
    }

    setupGestionEvents() {
        document.getElementById('btn-registrar-entrada').addEventListener('click', () => {
            this.registrarEntrada();
        });

        document.getElementById('btn-registrar-salida').addEventListener('click', () => {
            this.registrarSalida();
        });
    }

    // En setupBusquedaEvents() - REEMPLAZAR por:
setupBusquedaEvents() {
    // Para la búsqueda MEJORADA
    const tipoBusqueda = document.getElementById('tipo-busqueda');
    const btnBuscar = document.getElementById('btn-buscar');
    const valorBusqueda = document.getElementById('valor-busqueda');
    
    if (tipoBusqueda && btnBuscar && valorBusqueda) {
        // Cambiar placeholder según tipo de búsqueda
        tipoBusqueda.addEventListener('change', (e) => {
            this.actualizarPlaceholderBusqueda(e.target.value);
        });
        
        // Buscar
        btnBuscar.addEventListener('click', () => {
            this.buscarVehiculoMejorado();
        });
        
        // Enter para buscar
        valorBusqueda.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.buscarVehiculoMejorado();
        });
        
        // Inicializar placeholder
        this.actualizarPlaceholderBusqueda(tipoBusqueda.value);
    }
    
    // Para la búsqueda ANTIGUA (mantener compatibilidad)
    const btnBuscarPlaca = document.getElementById('btn-buscar-placa');
    if (btnBuscarPlaca) {
        btnBuscarPlaca.addEventListener('click', () => {
            this.buscarPlaca();
        });
    }
}

// Función para actualizar placeholder
actualizarPlaceholderBusqueda(tipo) {
    const input = document.getElementById('valor-busqueda');
    const label = document.getElementById('label-busqueda');
    
    if (!input || !label) return;
    
    const config = {
        'placa': { label: 'Placa del Vehículo:', placeholder: 'Ej: ABC123, MTP2024' },
        'codigo': { label: 'Código del Vehículo:', placeholder: 'Ej: BICI-001, PATIN-2024' },
        'descripcion': { label: 'Descripción:', placeholder: 'Ej: Bicicleta roja, Patineta azul' },
        'cupo': { label: 'Número de Cupo:', placeholder: 'Ej: MA01, MB15, MC20' }
    };
    
    label.textContent = config[tipo]?.label || 'Buscar:';
    input.placeholder = config[tipo]?.placeholder || 'Ingrese valor a buscar';
}

    // ===== FUNCIONALIDADES =====

   registrarEntrada() {
    const placaInput = document.getElementById('placa-entrada');
    const placa = placaInput.value.trim().toUpperCase();
    
    if (!placa) {
        this.mostrarNotificacion('Por favor ingrese una placa', 'error');
        return;
    }

    // Validar formato de placa
    if (!/^[A-Z]{3}\d{3}$/.test(placa)) {
        this.mostrarNotificacion('❌ Formato de placa inválido. Use: ABC123', 'error');
        return;
    }

    // Validar que la placa no esté repetida
    if (!this.storage.validarPlacaUnica(placa)) {
        this.mostrarNotificacion('❌ Esta placa ya está registrada en el parqueadero', 'error');
        return;
    }

    try {
        const cupoAsignado = this.storage.asignarCupo(placa);
        this.mostrarNotificacion(
            `✅ Entrada registrada. Cupo asignado: ${cupoAsignado.id}`, 
            'success'
        );
        placaInput.value = '';
    } catch (error) {
        this.mostrarNotificacion(error.message, 'error');
    }
}

registrarSalida() {
    const placaInput = document.getElementById('placa-salida');
    const placa = placaInput.value.trim().toUpperCase();
    
    if (!placa) {
        this.mostrarNotificacion('Por favor ingrese una placa', 'error');
        return;
    }

    try {
        const cupoLiberado = this.storage.liberarCupo(placa);
        
        // Calcular duración
        const entrada = new Date(cupoLiberado.timestamp);
        const salida = new Date();
        const diffMs = salida - entrada;
        const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        this.mostrarNotificacion(
            `✅ Salida registrada. Cupo ${cupoLiberado.id} liberado\n⏱️ Tiempo: ${diffHoras}h ${diffMinutos}m`, 
            'success'
        );
        placaInput.value = '';
    } catch (error) {
        this.mostrarNotificacion(error.message, 'error');
    }
}

   buscarPlaca() {
    const placaInput = document.getElementById('placa-busqueda');
    const placa = placaInput.value.trim().toUpperCase();
    const resultadoDiv = document.getElementById('resultado-busqueda');
    
    if (!placa) {
        this.mostrarNotificacion('Por favor ingrese una placa', 'error');
        return;
    }

    const resultado = this.storage.buscarPorPlaca(placa);
    
    if (resultado) {
        // Buscar información del vehículo si existe
        const vehiculos = this.storage.getVehiculos();
        const vehiculo = vehiculos.find(v => v.placa === placa);
        
        const entrada = new Date(resultado.timestamp);
        const ahora = new Date();
        const diffMs = ahora - entrada;
        const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        resultadoDiv.innerHTML = `
            <div style="background: #4CAF50; color: white; padding: 1.5rem; border-radius: 8px; margin-top: 1rem;">
                <h4 style="margin: 0 0 1rem 0;">✅ Motocicleta encontrada</h4>
                <p style="margin: 5px 0;"><strong>Placa:</strong> ${resultado.placa}</p>
                <p style="margin: 5px 0;"><strong>Cupo:</strong> ${resultado.id}</p>
                <p style="margin: 5px 0;"><strong>Zona:</strong> ${resultado.zona}</p>
                <p style="margin: 5px 0;"><strong>Hora de entrada:</strong> ${entrada.toLocaleString()}</p>
                <p style="margin: 5px 0;"><strong>Tiempo estacionado:</strong> ${diffHoras}h ${diffMinutos}m</p>
                ${vehiculo ? `
                    <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 5px; margin-top: 10px;">
                        <strong>📋 Información del Vehículo:</strong>
                        <p style="margin: 5px 0; font-size: 14px;">Tipo: ${vehiculo.tipo}</p>
                        <p style="margin: 5px 0; font-size: 14px;">Modelo: ${vehiculo.modelo || 'No especificado'}</p>
                        <p style="margin: 5px 0; font-size: 14px;">Color: ${vehiculo.color || 'No especificado'}</p>
                    </div>
                ` : ''}
            </div>
        `;
    } else {
        resultadoDiv.innerHTML = `
            <div style="background: #F44336; color: white; padding: 1.5rem; border-radius: 8px; margin-top: 1rem;">
                <h4 style="margin: 0 0 1rem 0;">❌ Motocicleta no encontrada</h4>
                <p style="margin: 0;">No se encontró la placa "${placa}" en el parqueadero</p>
            </div>
        `;
    }
}

    mostrarDetalleCupo(cupoId) {
        const cupos = this.storage.getCupos();
        const cupo = cupos.find(c => c.id === cupoId);
        
        if (cupo) {
            const info = `
Cupo: ${cupo.id}
Zona: ${cupo.zona}
Estado: ${cupo.estado}
${cupo.placa ? `Placa: ${cupo.placa}` : ''}
${cupo.timestamp ? `Hora: ${new Date(cupo.timestamp).toLocaleString()}` : ''}
            `;
            alert(info);
        }
    }

    mostrarConfigMapa() {
        alert(`Para configurar Google Maps:

1. Ve a https://console.cloud.google.com/
2. Crea un proyecto y activa Google Maps JavaScript API
3. Genera una API Key
4. Reemplaza "TU_API_KEY" en index.html

🌍 La funcionalidad del mapa estará disponible después de la configuración.`);
    }

    generateEstadoActual() {
        const metricas = this.storage.getMetricas();
        return `
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center;">
                <div>
                    <h4 style="margin: 0; color: #2196F3;">Total</h4>
                    <p style="font-size: 1.5rem; font-weight: bold; margin: 5px 0;">${metricas.total}</p>
                </div>
                <div>
                    <h4 style="margin: 0; color: #4CAF50;">Disponibles</h4>
                    <p style="font-size: 1.5rem; font-weight: bold; margin: 5px 0;">${metricas.disponibles}</p>
                </div>
                <div>
                    <h4 style="margin: 0; color: #F44336;">Ocupados</h4>
                    <p style="font-size: 1.5rem; font-weight: bold; margin: 5px 0;">${metricas.ocupados}</p>
                </div>
            </div>
        `;
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${tipo}`;
        notification.textContent = mensaje;
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
            ${tipo === 'success' ? 'background: #4CAF50;' : ''}
            ${tipo === 'error' ? 'background: #F44336;' : ''}
            ${tipo === 'info' ? 'background: #2196F3;' : ''}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    refreshCurrentView() {
        this.loadView(this.currentView);
    }

    getErrorHTML(mensaje) {
        return `
            <div class="error-view" style="padding: 2rem; text-align: center;">
                <h2 style="color: #F44336; margin-bottom: 1rem;">😕 Error al cargar la vista</h2>
                <p style="margin-bottom: 2rem;">${mensaje}</p>
                <button onclick="app.navigateTo('dashboard')" 
                        style="padding: 12px 24px; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
                    Volver al Dashboard
                </button>
            </div>
        `;
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM cargado, iniciando aplicación...');
    window.app = new UniParkApp();
});
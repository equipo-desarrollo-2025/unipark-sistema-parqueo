// js/storage.js - VERSIÓN COMPLETA Y CORREGIDA
class ParqueoStorage {
    constructor() {
        this.keys = {
            CUPOS: 'unipark_cupos',
            HISTORIAL: 'unipark_historial',
            CONFIG: 'unipark_config',
            USUARIOS: 'unipark_usuarios',
            USUARIO_ACTUAL: 'unipark_usuario_actual',
            VEHICULOS: 'unipark_vehiculos'
        };
        this.initStorage();
    }

    initStorage() {
        if (!this.getCupos()) {
            this.guardarCupos(this.generarCuposIniciales());
        }
        
        if (!this.getHistorial()) {
            this.guardarHistorial([]);
        }
        
        if (!this.getConfig()) {
            this.guardarConfig({
                totalCupos: 60,
                zonas: ['A', 'B', 'C'],
                horario: '6:00 - 22:00'
            });
        }

        if (!this.getUsuarios()) {
            this.guardarUsuarios([
                {
                    id: 'vigilante1',
                    nombre: 'Vigilante Principal',
                    rol: 'vigilante',
                    usuario: 'vigilante',
                    contraseña: '123456'
                },
                {
                    id: 'conductor1', 
                    nombre: 'Conductor Demo',
                    rol: 'conductor',
                    usuario: 'conductor',
                    contraseña: '123456'
                }
            ]);
        }

        if (!this.getVehiculos()) {
            this.guardarVehiculos([
                {
                    id: 'veh1',
                    conductorId: 'conductor1',
                    placa: 'ABC123',
                    tipo: 'Motocicleta',
                    color: 'Negro',
                    modelo: 'Honda CB190'
                }
            ]);
        }
    }

    // ===== SISTEMA DE CUPOS =====
    generarCuposIniciales() {
        const zonas = [
            { id: 'A', nombre: 'Norte', cantidad: 20 },
            { id: 'B', nombre: 'Centro', cantidad: 20 },
            { id: 'C', nombre: 'Sur', cantidad: 20 }
        ];
        
        const cupos = [];
        
        zonas.forEach(zona => {
            for (let i = 1; i <= zona.cantidad; i++) {
                const esOcupado = Math.random() < 0.25; // 25% probabilidad de ocupado
                const estado = esOcupado ? 'ocupado' : 'libre';
                
                cupos.push({
                    id: `M${zona.id}${i.toString().padStart(2, '0')}`,
                    zona: zona.id,
                    estado: estado,
                    placa: esOcupado ? this.generarPlacaAleatoria() : null,
                    timestamp: esOcupado ? new Date().toISOString() : null,
                    tipo: i <= 15 ? 'normal' : 'preferencial'
                });
            }
        });
        
        console.log('🏍️ Cupos generados:', cupos.filter(c => c.estado === 'libre').length + '/60 libres');
        return cupos;
    }

    generarPlacaAleatoria() {
        const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numeros = '0123456789';
        
        let placa = '';
        for (let i = 0; i < 3; i++) {
            placa += letras.charAt(Math.floor(Math.random() * letras.length));
        }
        for (let i = 0; i < 3; i++) {
            placa += numeros.charAt(Math.floor(Math.random() * numeros.length));
        }
        
        return placa;
    }

    // Getters
    getCupos() {
        return JSON.parse(localStorage.getItem(this.keys.CUPOS)) || [];
    }

    getHistorial() {
        return JSON.parse(localStorage.getItem(this.keys.HISTORIAL)) || [];
    }

    getConfig() {
        return JSON.parse(localStorage.getItem(this.keys.CONFIG)) || {};
    }

    // Setters
    guardarCupos(cupos) {
        localStorage.setItem(this.keys.CUPOS, JSON.stringify(cupos));
        this.dispatchStorageEvent();
    }

    guardarHistorial(historial) {
        localStorage.setItem(this.keys.HISTORIAL, JSON.stringify(historial));
    }

    guardarConfig(config) {
        localStorage.setItem(this.keys.CONFIG, JSON.stringify(config));
    }

    // Operaciones específicas
    asignarCupo(placa) {
        const cupos = this.getCupos();
        const cupoLibre = cupos.find(cupo => cupo.estado === 'libre' && cupo.tipo === 'normal');
        
        if (!cupoLibre) {
            throw new Error('No hay cupos disponibles');
        }

        cupoLibre.estado = 'ocupado';
        cupoLibre.placa = placa.toUpperCase();
        cupoLibre.timestamp = new Date().toISOString();

        // Agregar al historial
        const historial = this.getHistorial();
        historial.push({
            placa: placa.toUpperCase(),
            cupo: cupoLibre.id,
            accion: 'entrada',
            timestamp: cupoLibre.timestamp
        });

        this.guardarCupos(cupos);
        this.guardarHistorial(historial);

        return cupoLibre;
    }

    liberarCupo(placa) {
        const cupos = this.getCupos();
        const cupoOcupado = cupos.find(cupo => 
            cupo.placa === placa.toUpperCase() && cupo.estado === 'ocupado'
        );
        
        if (!cupoOcupado) {
            throw new Error('No se encontró la placa en el parqueadero');
        }

        // Agregar al historial
        const historial = this.getHistorial();
        historial.push({
            placa: placa.toUpperCase(),
            cupo: cupoOcupado.id,
            accion: 'salida',
            timestamp: new Date().toISOString()
        });

        cupoOcupado.estado = 'libre';
        cupoOcupado.placa = null;
        cupoOcupado.timestamp = null;

        this.guardarCupos(cupos);
        this.guardarHistorial(historial);

        return cupoOcupado;
    }

    buscarPorPlaca(placa) {
        const cupos = this.getCupos();
        return cupos.find(cupo => 
            cupo.placa === placa.toUpperCase() && cupo.estado === 'ocupado'
        );
    }

    getMetricas() {
        const cupos = this.getCupos();
        const total = cupos.length;
        const ocupados = cupos.filter(c => c.estado === 'ocupado').length;
        const disponibles = cupos.filter(c => c.estado === 'libre').length;
        
        let porcentajeOcupacion = 0;
        if (total > 0) {
            porcentajeOcupacion = (ocupados / total) * 100;
        }

        return {
            total,
            ocupados,
            disponibles,
            porcentajeOcupacion: porcentajeOcupacion.toFixed(1)
        };
    }

    // ===== SISTEMA DE USUARIOS =====
    getUsuarios() {
        return JSON.parse(localStorage.getItem(this.keys.USUARIOS)) || [];
    }

    guardarUsuarios(usuarios) {
        localStorage.setItem(this.keys.USUARIOS, JSON.stringify(usuarios));
    }

    guardarUsuarioActual(usuario) {
        localStorage.setItem(this.keys.USUARIO_ACTUAL, JSON.stringify(usuario));
    }

    getUsuarioActual() {
        return JSON.parse(localStorage.getItem(this.keys.USUARIO_ACTUAL)) || null;
    }

    cerrarSesion() {
        localStorage.removeItem(this.keys.USUARIO_ACTUAL);
        this.dispatchStorageEvent();
    }

    // ===== SISTEMA DE VEHÍCULOS =====

    // En storage.js - AGREGAR estas funciones
// En la clase ParqueoStorage - AGREGAR estas funciones:

buscarVehiculoCompleto(tipo, valor) {
    const cupos = this.getCupos();
    const valorUpper = valor.toUpperCase();
    
    switch(tipo) {
        case 'placa':
            const porPlaca = cupos.find(c => c.placa === valorUpper && c.estado === 'ocupado');
            if (porPlaca) {
                return {
                    encontrado: true,
                    tipo: 'ocupado',
                    datos: porPlaca,
                    vehiculo: this.inferirTipoVehiculo(porPlaca.placa)
                };
            }
            break;
            
        case 'codigo':
            // Para búsqueda por código (no implementado aún)
            const porCodigo = cupos.find(c => 
                c.codigo === valorUpper && c.estado === 'ocupado'
            );
            if (porCodigo) {
                return {
                    encontrado: true,
                    tipo: 'ocupado', 
                    datos: porCodigo,
                    vehiculo: this.inferirTipoVehiculo(porCodigo.placa || porCodigo.codigo)
                };
            }
            break;
            
        case 'cupo':
            const porCupo = cupos.find(c => c.id === valorUpper);
            if (porCupo) {
                return {
                    encontrado: true,
                    tipo: porCupo.estado,
                    datos: porCupo,
                    vehiculo: porCupo.estado === 'ocupado' ? 
                        this.inferirTipoVehiculo(porCupo.placa || porCupo.codigo) : null
                };
            }
            break;
            
        case 'descripcion':
            // Búsqueda simple por descripción (puede expandirse)
            const porDescripcion = cupos.find(c => 
                c.placa && c.placa.includes(valorUpper) && c.estado === 'ocupado'
            );
            if (porDescripcion) {
                return {
                    encontrado: true,
                    tipo: 'ocupado',
                    datos: porDescripcion,
                    vehiculo: this.inferirTipoVehiculo(porDescripcion.placa)
                };
            }
            break;
    }
    
    return { encontrado: false };
}

inferirTipoVehiculo(identificador) {
    if (!identificador) return { tipo: 'desconocido', icon: '❓' };
    
    const id = identificador.toString().toUpperCase();
    
    if (id.startsWith('BICI') || id.includes('BICICLETA')) {
        return { tipo: 'bicicleta', icon: '🚲' };
    } else if (id.startsWith('PATIN') || id.includes('PATINETA')) {
        return { tipo: 'patineta', icon: '🛴' };
    } else if (/^[A-Z]{3}\d{3,4}$/.test(id)) {
        return { tipo: 'motocicleta', icon: '🏍️' };
    } else if (/^[A-Z]{2,3}\d{4}$/.test(id)) {
        return { tipo: 'carro', icon: '🚗' };
    } else {
        return { tipo: 'otro', icon: '🚙' };
    }
}

getTiposVehiculo() {
    return {
        'motocicleta': { 
            icon: '🏍️', 
            metodos: ['placa', 'codigo'],
            requierePlaca: true
        },
        'bicicleta': { 
            icon: '🚲', 
            metodos: ['codigo', 'descripcion'],
            requierePlaca: false
        },
        'patineta': { 
            icon: '🛴', 
            metodos: ['codigo', 'descripcion'], 
            requierePlaca: false
        },
        'carro': { 
            icon: '🚗', 
            metodos: ['placa'],
            requierePlaca: true
        }
    };
} 
    getVehiculos() {
        return JSON.parse(localStorage.getItem(this.keys.VEHICULOS)) || [];
    }

    guardarVehiculos(vehiculos) {
        localStorage.setItem(this.keys.VEHICULOS, JSON.stringify(vehiculos));
    }

    getVehiculoPorConductor(conductorId) {
        const vehiculos = this.getVehiculos();
        return vehiculos.find(v => v.conductorId === conductorId) || null;
    }

    guardarVehiculo(vehiculo) {
        const vehiculos = this.getVehiculos();
        const index = vehiculos.findIndex(v => v.conductorId === vehiculo.conductorId);
        
        if (index !== -1) {
            vehiculos[index] = vehiculo;
        } else {
            vehiculos.push(vehiculo);
        }
        
        this.guardarVehiculos(vehiculos);
        this.dispatchStorageEvent();
    }

    // Validar que no se repitan placas
    validarPlacaUnica(placa) {
        const cupos = this.getCupos();
        return !cupos.some(cupo => cupo.placa === placa.toUpperCase());
    }

   

    onUpdate(callback) {
        window.addEventListener('storageUpdate', callback);
        window.addEventListener('storage', callback);
    }
    // En storage.js - agregar configuración de vehículos
getTiposVehiculo() {
    return {
        'motocicleta': { 
            icon: '🏍️', 
            metodos: ['placa', 'codigo'],
            requierePlaca: true
        },
        'bicicleta': { 
            icon: '🚲', 
            metodos: ['codigo', 'descripcion'],
            requierePlaca: false
        },
        'patineta': { 
            icon: '🛴', 
            metodos: ['codigo', 'descripcion'], 
            requierePlaca: false
        },
        'carro': { 
            icon: '🚗', 
            metodos: ['placa'],
            requierePlaca: true
        }
    };
}



// En la clase ParqueoStorage - agregar esta función:
dispatchStorageEvent() {
    // Disparar evento personalizado para notificar cambios
    window.dispatchEvent(new CustomEvent('storageUpdate', {
        detail: { timestamp: new Date().toISOString() }
    }));
    
    // También disparar el evento storage nativo para compatibilidad
    window.dispatchEvent(new Event('storage'));
}

// Y también modificar el onUpdate para que sea más robusto:
onUpdate(callback) {
    window.addEventListener('storageUpdate', callback);
    window.addEventListener('storage', callback);
    
    // Retornar función para remover listeners
    return () => {
        window.removeEventListener('storageUpdate', callback);
        window.removeEventListener('storage', callback);
    };
}
}



// Instancia global
const parqueoStorage = new ParqueoStorage();
// js/gestion.js
class Gestion {
    constructor(app) {
        this.app = app;
    }

    initialize() {
        console.log('👮 Módulo de Gestión inicializado');
        this.renderGestion();
        this.setupEventListeners();
    }

    renderGestion() {
        const gestionHTML = `
            <div class="view active" id="gestion-view">
                <h1>👮 Gestión de Vigilantes</h1>
                
                <div class="management-grid">
                    <div class="management-card">
                        <h2>🚀 Registrar Entrada</h2>
                        <div class="form-group">
                            <label class="form-label" for="placa-entrada">Placa de la Motocicleta:</label>
                            <input type="text" 
                                   id="placa-entrada" 
                                   class="form-input" 
                                   placeholder="Ej: ABC123"
                                   maxlength="6"
                                   required>
                        </div>
                        <button id="btn-registrar-entrada" class="btn btn-success">
                            Registrar Entrada
                        </button>
                    </div>
                    
                    <div class="management-card">
                        <h2>🛑 Registrar Salida</h2>
                        <div class="form-group">
                            <label class="form-label" for="placa-salida">Placa de la Motocicleta:</label>
                            <input type="text" 
                                   id="placa-salida" 
                                   class="form-input" 
                                   placeholder="Ej: ABC123"
                                   maxlength="6"
                                   required>
                        </div>
                        <button id="btn-registrar-salida" class="btn btn-danger">
                            Registrar Salida
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('app').innerHTML = gestionHTML;
    }

    setupEventListeners() {
        document.getElementById('btn-registrar-entrada').addEventListener('click', () => {
            this.registrarEntrada();
        });

        document.getElementById('btn-registrar-salida').addEventListener('click', () => {
            this.registrarSalida();
        });
    }

    registrarEntrada() {
        const placaInput = document.getElementById('placa-entrada');
        const placa = placaInput.value.trim();
        
        if (!placa) {
            Utils.showNotification('Por favor ingrese una placa', 'error');
            return;
        }

        try {
            const cupoAsignado = this.app.storage.asignarCupo(placa);
            Utils.showNotification(
                `✅ Entrada registrada. Cupo asignado: ${cupoAsignado.id}`, 
                'success'
            );
            placaInput.value = '';
        } catch (error) {
            Utils.showNotification(error.message, 'error');
        }
    }

    registrarSalida() {
        const placaInput = document.getElementById('placa-salida');
        const placa = placaInput.value.trim();
        
        if (!placa) {
            Utils.showNotification('Por favor ingrese una placa', 'error');
            return;
        }

        try {
            const cupoLiberado = this.app.storage.liberarCupo(placa);
            Utils.showNotification(
                `✅ Salida registrada. Cupo ${cupoLiberado.id} liberado`, 
                'success'
            );
            placaInput.value = '';
        } catch (error) {
            Utils.showNotification(error.message, 'error');
        }
    }
}
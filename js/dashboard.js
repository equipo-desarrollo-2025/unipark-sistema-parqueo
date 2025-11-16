// js/dashboard.js
class Dashboard {
    constructor(app) {
        this.app = app;
    }

    initialize() {
        console.log('📊 Dashboard inicializado');
        this.renderDashboard();
        this.setupEventListeners();
    }

    renderDashboard() {
        const metricas = this.app.storage.getMetricas();
        const cupos = this.app.storage.getCupos();
        
        const dashboardHTML = `
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
                        <p>${metricas.porcentajeOcupacion}% de ocupación</p>
                    </div>
                </div>
                
                <div class="section">
                    <h2>🏍️ Estado de Cupos</h2>
                    <div class="cupos-grid" id="cupos-grid">
                        ${this.generateCuposHTML(cupos)}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('app').innerHTML = dashboardHTML;
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

    setupEventListeners() {
        // Agregar interactividad a los cupos
        document.querySelectorAll('.cupo').forEach(cupo => {
            cupo.addEventListener('click', (e) => {
                const cupoId = e.target.dataset.cupoId;
                this.mostrarDetalleCupo(cupoId);
            });
        });
    }

    mostrarDetalleCupo(cupoId) {
        const cupos = this.app.storage.getCupos();
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

    refresh() {
        this.renderDashboard();
        this.setupEventListeners();
    }
}
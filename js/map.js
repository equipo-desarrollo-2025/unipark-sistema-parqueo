// js/map.js
class Mapa {
    constructor(app) {
        this.app = app;
    }

    initialize() {
        console.log('🗺️ Módulo de Mapa inicializado');
        this.renderMapa();
    }

    
    renderMapa() {
        const mapaHTML = `
            <div class="view active" id="mapa-view">
                <h1>🗺️ Mapa en Tiempo Real</h1>
                <p>Visualiza la ocupación del parqueadero en el mapa universitario</p>
                
                <div id="map-container" style="height: 400px; background: #e0e0e0; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
                    <div style="text-align: center;">
                        <h3>🌍 Mapa Interactivo</h3>
                        <p>Para una implementación completa, necesitarías una API key de Google Maps</p>
                        <button onclick="alert('Esta funcionalidad requiere configuración de Google Maps API')" 
                                style="padding: 10px 20px; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 1rem;">
                            Configurar Google Maps
                        </button>
                    </div>
                </div>
                
                <div class="map-legend" style="display: flex; gap: 1rem; margin-top: 1rem; justify-content: center;">
                    <div class="legend-item" style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="width: 20px; height: 20px; background: #4CAF50; border-radius: 4px;"></div>
                        <span>Cupo Libre</span>
                    </div>
                    <div class="legend-item" style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="width: 20px; height: 20px; background: #F44336; border-radius: 4px;"></div>
                        <span>Cupo Ocupado</span>
                    </div>
                </div>
            </div>



            
        `;

        document.getElementById('app').innerHTML = mapaHTML;
    }


    seleccionarZona(zona) {
    const info = {
        'A': { nombre: "Zona A - Norte", libres: 15, total: 20, edificio: "Edificio Principal", color: "#4CAF50" },
        'B': { nombre: "Zona B - Centro", libres: 10, total: 20, edificio: "Biblioteca", color: "#FF9800" },
        'C': { nombre: "Zona C - Sur", libres: 5, total: 20, edificio: "Comedor", color: "#F44336" }
    };
    
    const data = info[zona];
    const porcentaje = (data.libres / data.total) * 100;
    
    document.getElementById('info-zona').innerHTML = `
        <div style="background: ${data.color}20; padding: 15px; border-radius: 8px; border-left: 4px solid ${data.color};">
            <h4 style="margin: 0 0 10px 0; color: ${data.color};">${data.nombre}</h4>
            <p style="margin: 5px 0;"><strong>🏢 Edificio:</strong> ${data.edificio}</p>
            <p style="margin: 5px 0;"><strong>🏍️ Cupos libres:</strong> ${data.libres}/${data.total}</p>
            <p style="margin: 5px 0;"><strong>📊 Disponibilidad:</strong> ${porcentaje.toFixed(0)}%</p>
            <progress value="${data.libres}" max="${data.total}" style="width: 100%; height: 10px;"></progress>
            
            <button onclick="app.reservarCupo('${zona}')" 
                    style="padding: 10px 15px; background: ${data.color}; color: white; border: none; border-radius: 5px; cursor: pointer; width: 100%; margin-top: 10px;">
                Reservar en ${zona}
            </button>
        </div>
    `;
}

}


// Define the URL of the earthquake data JSON
const earthquakeDataUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Create a Leaflet map centered at a specific location and zoom level
const map = L.map("map").setView([0, 0], 2);

// Add a tile layer for the base map (e.g., OpenStreetMap)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Function to calculate marker size based on earthquake magnitude
function getMarkerSize(magnitude) {
    return Math.sqrt(magnitude) * 5;
}

// Function to calculate marker color based on earthquake depth
function getMarkerColor(depth) {
    if (depth > 100) return "darkred";
    if (depth > 50) return "red";
    return "orange";
}

// Function to create a custom marker style
function createMarkerStyle(feature) {
    return {
        radius: getMarkerSize(feature.properties.mag),
        fillColor: getMarkerColor(feature.geometry.coordinates[2]),
        color: "black",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
}

// Function to bind a popup with earthquake information to each marker
function onEachFeature(feature, layer) {
    layer.bindPopup(
        `<strong>Location:</strong> ${feature.properties.place}<br>
        <strong>Magnitude:</strong> ${feature.properties.mag}<br>
        <strong>Depth:</strong> ${feature.geometry.coordinates[2]} km`
    );
}

// Fetch and add earthquake data to the map
fetch(earthquakeDataUrl)
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, createMarkerStyle(feature));
            },
            onEachFeature: onEachFeature
        }).addTo(map);
    });

// Create a legend
const legend = L.control({ position: "bottomright" });
legend.onAdd = function (map) {
    const div = L.DomUtil.create("div", "info legend");
    const depths = [0, 50, 100];
    const labels = [];

    for (let i = 0; i < depths.length; i++) {
        const from = depths[i];
        const to = depths[i + 1];
        const color = getMarkerColor(from + 1);

        labels.push(
            `<div class="legend-item">
                <div class="legend-color" style="background:${color};"></div>
                <div class="legend-label">${from + 1} ${to ? `&ndash; ${to}` : "+"} km</div>
            </div>`
        );
    }

    div.innerHTML = `<strong>Depth</strong><br>${labels.join("")}`;
    return div;
};

legend.addTo(map);

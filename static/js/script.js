
const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");
const searchForm = document.getElementById("searchForm");
const message = document.getElementById("message");

let pollutionChart;

// Default location: Bengaluru
let currentLocation = {
    name: "Bengaluru",
    country: "India",
    latitude: 12.9716,
    longitude: 77.5946
};

// AQI categories based on US EPA AQI ranges
function getAQIInfo(aqi) {
    if (aqi <= 50) {
        return {
            category: "Good",
            description: "Air quality is satisfactory.",
            advice: "Air quality is good. Outdoor activities can generally continue as normal.",
            color: "#5ce0a0"
        };
    }

    if (aqi <= 100) {
        return {
            category: "Moderate",
            description: "Acceptable air quality.",
            advice: "Air quality is generally acceptable. People unusually sensitive to pollution may wish to limit prolonged outdoor exertion.",
            color: "#d7df5a"
        };
    }

    if (aqi <= 150) {
        return {
            category: "Unhealthy for Sensitive Groups",
            description: "Some people may be affected.",
            advice: "Sensitive groups, including people with asthma, may benefit from reducing prolonged or strenuous outdoor activity.",
            color: "#f6a44a"
        };
    }

    if (aqi <= 200) {
        return {
            category: "Unhealthy",
            description: "Health effects may occur.",
            advice: "Consider reducing prolonged outdoor exertion, particularly if you are sensitive to air pollution.",
            color: "#ef5a55"
        };
    }

    if (aqi <= 300) {
        return {
            category: "Very Unhealthy",
            description: "Health alert: increased risk.",
            advice: "Reduce outdoor exertion and pay attention to local air-quality guidance.",
            color: "#a85bce"
        };
    }

    return {
        category: "Hazardous",
        description: "Serious health warning.",
        advice: "Avoid prolonged outdoor exertion and follow local public-health advice.",
        color: "#a83b55"
    };
}

function setLoading(isLoading) {
    searchButton.disabled = isLoading;
    searchButton.textContent = isLoading ? "Loading..." : "Search";
}

// Search for a city using Open-Meteo Geocoding
async function searchCity(city) {
    if (!city.trim()) {
        message.textContent = "Please enter a city name.";
        return;
    }

    message.textContent = "Searching for city...";
    setLoading(true);

    try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("City search failed.");
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            message.textContent = "City not found. Try another name.";
            return;
        }

        const result = data.results[0];

        currentLocation = {
            name: result.name,
            country: result.country || "",
            latitude: result.latitude,
            longitude: result.longitude
        };

        await loadAirQuality();

    } catch (error) {
        message.textContent = "Unable to search. Please try again.";
        console.error(error);
    } finally {
        setLoading(false);
    }
}

// Fetch actual air-quality measurements
async function loadAirQuality() {
    message.textContent = "Fetching live air-quality data...";
    setLoading(true);

    try {
        const url =
            `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${currentLocation.latitude}&longitude=${currentLocation.longitude}&current=us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&hourly=pm2_5&past_days=1&forecast_days=1&timezone=auto`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Air-quality API request failed.");
        }

        const data = await response.json();

        if (!data.current) {
            throw new Error("No current measurements available.");
        }

        displayData(data);

        message.textContent =
            `Monitoring ${currentLocation.name}, ${currentLocation.country}.`;

    } catch (error) {
        message.textContent = "Could not load air-quality data.";
        console.error(error);
    } finally {
        setLoading(false);
    }
}

// Display the readings
function displayData(data) {
    const current = data.current;

    const aqi = current.us_aqi;
    const info = aqi != null ? getAQIInfo(aqi) : { color: "#91a2b8" };

    document.getElementById("aqiValue").textContent =
        aqi != null ? Math.round(aqi) : "--";

    const category = document.getElementById("aqiCategory");
    category.textContent = aqi != null ? info.category : "Unavailable";
    category.style.color = info.color;

    document.getElementById("aqiDescription").textContent =
        aqi != null ? info.description : "AQI measurement unavailable.";

    document.getElementById("aqiValue").style.color = info.color;

    document.getElementById("locationName").textContent =
        `${currentLocation.name}, ${currentLocation.country}`;

    document.getElementById("researchLocation").textContent =
        `${currentLocation.name}, ${currentLocation.country}`;

    document.getElementById("researchCoordinates").textContent =
        `${Number(currentLocation.latitude).toFixed(4)}, ${Number(currentLocation.longitude).toFixed(4)}`;

    document.getElementById("observationTime").textContent =
        current.time ? current.time.replace("T", " ") : "Unavailable";

    document.getElementById("pm25").textContent =
        formatValue(current.pm2_5);

    document.getElementById("pm10").textContent =
        formatValue(current.pm10);

    document.getElementById("co").textContent =
        formatValue(current.carbon_monoxide) + " µg/m³";

    document.getElementById("no2").textContent =
        formatValue(current.nitrogen_dioxide) + " µg/m³";

    document.getElementById("so2").textContent =
        formatValue(current.sulphur_dioxide) + " µg/m³";

    document.getElementById("ozone").textContent =
        formatValue(current.ozone) + " µg/m³";

    document.getElementById("healthTitle").textContent =
        aqi != null ? `${info.category} air quality` : "AQI unavailable";

    document.getElementById("healthAdvice").textContent =
        aqi != null ? info.advice : "Health recommendations are unavailable without an AQI reading.";

    updateChart(data);
}

// Format measurements safely
function formatValue(value) {
    return value != null ? Number(value).toFixed(1) : "--";
}

// Create or update pollution chart
function updateChart(data) {
    if (!data.hourly || !data.hourly.time || !data.hourly.pm2_5) {
        return;
    }

    const ctx = document.getElementById("pollutionChart");

    if (!ctx || typeof Chart === "undefined") {
        console.warn("Chart.js is unavailable; displaying readings without the chart.");
        return;
    }

    const times = data.hourly.time;
    const values = data.hourly.pm2_5;

    const labels = [];
    const readings = [];

    // Show recent and upcoming measurements
    const currentTime = data.current.time;
    const currentIndex = Math.max(0, times.indexOf(currentTime));
    const start = Math.max(0, currentIndex - 6);
    const end = Math.min(times.length, currentIndex + 7);

    for (let i = start; i < end; i++) {
        labels.push(times[i].slice(11, 16));
        readings.push(values[i]);
    }

    if (pollutionChart) {
        pollutionChart.destroy();
    }

    pollutionChart = new Chart(ctx, {
        type: "line",

        data: {
            labels: labels,
            datasets: [{
                label: "PM2.5",
                data: readings,
                borderColor: "#43d9e8",
                backgroundColor: "rgba(67, 217, 232, 0.12)",
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: "#5ce0a0"
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                }
            },

            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: "#91a2b8"
                    }
                },

                y: {
                    beginAtZero: true,
                    grid: {
                        color: "rgba(145, 162, 184, 0.12)"
                    },
                    ticks: {
                        color: "#91a2b8"
                    }
                }
            }
        }
    });
}

// Search form
searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    searchCity(cityInput.value);
});

// Date display
document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

// Start the application
loadAirQuality();

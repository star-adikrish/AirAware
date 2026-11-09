
const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");
const searchForm = document.getElementById("searchForm");
const message = document.getElementById("message");

let pollutionChart;
let requestSequence = 0;

let currentLocation = {
    name: "Bengaluru",
    country: "India",
    latitude: 12.9716,
    longitude: 77.5946
};

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
    searchForm.setAttribute("aria-busy", String(isLoading));
}

async function searchCity(city) {
    const query = city.trim();

    if (!query) {
        message.textContent = "Please enter a city name.";
        cityInput.focus();
        return;
    }

    message.textContent = "Searching for city...";
    setLoading(true);

    const requestId = ++requestSequence;

    try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;

        const response = await fetchWithTimeout(url);

        if (!response.ok) {
            throw new Error("City search failed.");
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            message.textContent = "City not found. Try another name.";
            return;
        }

        const result = data.results[0];

        const location = {
            name: result.name,
            country: result.country || "",
            latitude: result.latitude,
            longitude: result.longitude
        };

        await loadAirQuality(location, requestId);

    } catch (error) {
        if (requestId === requestSequence) {
            message.textContent = getErrorMessage(
                error,
                "Unable to search. Please try again."
            );
        }

        console.error(error);

    } finally {
        if (requestId === requestSequence) {
            setLoading(false);
        }
    }
}

async function loadAirQuality(
    location = currentLocation,
    requestId = ++requestSequence
) {
    message.textContent = "Fetching live air-quality data...";
    setLoading(true);

    try {
        const url =
            `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${location.latitude}&longitude=${location.longitude}&current=us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&hourly=pm2_5&past_days=1&forecast_days=1&timezone=auto`;

        const response = await fetchWithTimeout(url);

        if (!response.ok) {
            throw new Error("Air-quality API request failed.");
        }

        const data = await response.json();

        if (!data.current) {
            throw new Error("No current measurements available.");
        }

        if (requestId !== requestSequence) {
            return;
        }

        currentLocation = location;

        displayData(data);

        message.textContent =
            `Monitoring ${currentLocation.name}, ${currentLocation.country}.`;

    } catch (error) {
        if (requestId === requestSequence) {
            message.textContent = getErrorMessage(
                error,
                "Could not load air-quality data."
            );
        }

        console.error(error);

    } finally {
        if (requestId === requestSequence) {
            setLoading(false);
        }
    }
}

async function fetchWithTimeout(url, timeout = 10000) {
    const controller = new AbortController();

    const timeoutId = setTimeout(
        () => controller.abort(),
        timeout
    );

    try {
        return await fetch(url, {
            signal: controller.signal
        });
    } finally {
        clearTimeout(timeoutId);
    }
}

function getErrorMessage(error, fallback) {
    return error.name === "AbortError"
        ? "The request timed out. Please try again."
        : fallback;
}

function formatValue(value) {
    const number = toFiniteNumber(value);

    return number !== null
        ? number.toFixed(1)
        : "--";
}

function toFiniteNumber(value) {
    const number = Number(value);

    return value != null && Number.isFinite(number)
        ? number
        : null;
}

// Animated AQI gauge
function updateAQIGauge(aqi, color) {
    const gauge = document.getElementById("aqiGaugeProgress");

    if (!gauge) return;

    const circumference = 2 * Math.PI * 50;

    gauge.style.strokeDasharray = circumference;

    if (aqi === null) {
        gauge.style.strokeDashoffset = circumference;
        gauge.style.stroke = "#30363d";
        return;
    }

    const progress = Math.min(Math.max(aqi, 0), 500) / 500;

    gauge.style.strokeDashoffset =
        circumference * (1 - progress);

    gauge.style.stroke = color;
}

function displayData(data) {
    const current = data.current;

    const aqi = toFiniteNumber(current.us_aqi);

    const info = aqi !== null
        ? getAQIInfo(aqi)
        : { color: "#91a2b8" };

    document.getElementById("aqiValue").textContent =
        aqi !== null ? Math.round(aqi) : "--";

    const category = document.getElementById("aqiCategory");

    category.textContent =
        aqi !== null ? info.category : "Unavailable";

    category.style.color = info.color;

    document.getElementById("aqiDescription").textContent =
        aqi !== null
            ? info.description
            : "AQI measurement unavailable.";

    document.getElementById("aqiValue").style.color = info.color;

    updateAQIGauge(aqi, info.color);

    document.getElementById("locationName").textContent =
        `${currentLocation.name}, ${currentLocation.country}`;

    document.getElementById("researchLocation").textContent =
        `${currentLocation.name}, ${currentLocation.country}`;

    document.getElementById("researchCoordinates").textContent =
        `${Number(currentLocation.latitude).toFixed(4)}, ${Number(currentLocation.longitude).toFixed(4)}`;

    document.getElementById("observationTime").textContent =
        current.time
            ? current.time.replace("T", " ")
            : "Unavailable";

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
        aqi !== null
            ? `${info.category} air quality`
            : "AQI unavailable";

    document.getElementById("healthAdvice").textContent =
        aqi !== null
            ? info.advice
            : "Health recommendations are unavailable without an AQI reading.";

    updateChart(data);
}

function updateChart(data) {
    if (!data.hourly?.time?.length || !data.hourly.pm2_5?.length) {
        return;
    }

    const ctx = document.getElementById("pollutionChart");

    if (!ctx || typeof Chart === "undefined") {
        console.warn(
            "Chart.js is unavailable; displaying readings without the chart."
        );
        return;
    }

    const times = data.hourly.time;
    const values = data.hourly.pm2_5;

    const labels = [];
    const readings = [];

    const currentTime = Date.parse(data.current.time);

    const currentIndex = times.reduce((closestIndex, time, index) => {
        if (!Number.isFinite(currentTime)) {
            return closestIndex;
        }

        const closestDistance = Math.abs(
            Date.parse(times[closestIndex]) - currentTime
        );

        const distance = Math.abs(
            Date.parse(time) - currentTime
        );

        return distance < closestDistance
            ? index
            : closestIndex;

    }, 0);

    const start = Math.max(0, currentIndex - 6);
    const end = Math.min(times.length, currentIndex + 7);

    for (let i = start; i < end; i++) {
        const value = toFiniteNumber(values[i]);

        if (value !== null) {
            labels.push(times[i].slice(11, 16));
            readings.push(value);
        }
    }

    if (!readings.length) {
        return;
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
                borderColor: "#58a6ff",
                backgroundColor: "rgba(88, 166, 255, 0.12)",
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
                        color: "#8b949e"
                    }
                },

                y: {
                    beginAtZero: true,

                    grid: {
                        color: "rgba(145, 162, 184, 0.12)"
                    },

                    ticks: {
                        color: "#8b949e"
                    }
                }
            }
        }
    });
}

searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    searchCity(cityInput.value);
});

document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

loadAirQuality();

const cursor = document.querySelector(".cursor-glow");

if (cursor) {
    document.addEventListener("mousemove", (event) => {
        cursor.style.left = `${event.clientX}px`;
        cursor.style.top = `${event.clientY}px`;
    });
}

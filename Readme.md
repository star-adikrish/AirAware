# AirAware

AirAware is a Flask dashboard for exploring current air-quality conditions by
city. It uses the Open-Meteo geocoding and air-quality APIs to display US AQI,
particulate matter, gaseous pollutants, and an hourly PM2.5 trend.

## Run locally

1. Install Flask:

   ```bash
   python -m pip install flask
   ```

2. Start the server from this directory:

   ```bash
   python app.py
   ```

3. Open <http://127.0.0.1:5000> in a browser.

The browser needs network access to query Open-Meteo. Set `FLASK_DEBUG=true`
only for local development; debug mode is disabled by default.

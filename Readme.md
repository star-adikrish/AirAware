# AirAware

AirAware is a Flask app that shows live air quality data for cities using the Open-Meteo API. It displays AQI, PM2.5, PM10, and major pollutants in a simple dashboard.

## Features

- Live AQI and pollution overview
- PM2.5 and PM10 tracking
- CO, NO2, SO2, and ozone readings
- Hourly PM2.5 trend chart
- Mobile-friendly dashboard
## AI Declaration 
I did use AI as i was getting few errors in Java and for debugging 
Added comments by AI so its easier for the reviewer
Im new to a few concepts for which i used AI but now I don't need to rely on AI
I Found lots of issues which i wasn't able to fix so i used AI at that moment but after the unship i have learnt the debugging for this website
## Run locally

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python3 app.py
```

Open: `http://127.0.0.1:5000`

## Run on phone

Connect your phone and computer to the same Wi-Fi network, then use your computer's local IP:

```bash
ipconfig getifaddr en0
```

If needed:

```bash
ipconfig getifaddr en1
```

Then open:

```text
http://YOUR_COMPUTER_IP:5000
```

## Notes

- Do not open `templates/index.html` directly.
- The app needs internet access to fetch live Open-Meteo data.
- Use `FLASK_DEBUG=true` only for local development.

Stay aware. Breathe better.

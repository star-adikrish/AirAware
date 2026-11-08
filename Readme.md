# AirAware

## Developer Review 

AirAware is a mobile app or as you might say a weather app. You might be thinking this is a normal app but it has many uses:-
## Firstly,

It tells a user the Air Quality Index(AQI) of their city and points out the air pollution level or if it safe for people who have health issues
Not only is this website focused for people with health issues but also for weather Geeks.

## Secondly

The whole website is free from fee and adds not like the current apps on the market

## STAY AWARE & BREATHE BETTER

## I hope you enjoy your experience with our AIRAWARE app


AirAware gave me the opportunity to take an idea and actually build something out of it. I'm still learning, but I'm genuinely happy with how the project has developed and how much I've learned while making it.
AirAware is a Flask dashboard for exploring current air-quality conditions by
city. It uses the Open-Meteo geocoding and air-quality APIs to display US AQI,
particulate matter, gaseous pollutants, and an hourly PM2.5 trend.

## Run locally

1. Create and activate a virtual environment:

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. Install the application dependencies:

   ```bash
   python -m pip install -r requirements.txt
   ```

3. Start the Flask application from this directory:

   ```bash
   python3 app.py
   ```

4. Open <http://127.0.0.1:5000> in a browser on the computer.

## Open on a phone

Connect the phone and computer to the same Wi-Fi network. Find the
computer's local IP address:

```bash
ipconfig getifaddr en0
```

If that prints nothing, try:

```bash
ipconfig getifaddr en1
```

Start the app, then open this address on the phone, replacing the IP:

```text
http://YOUR_COMPUTER_IP:5000
```

For example: `http://192.168.1.25:5000`. Keep the Flask terminal running.
If macOS asks whether Python may accept incoming connections, allow it.

Do not open `templates/index.html` directly. Flask renders that template and
serves its CSS and JavaScript from the `/static` directory. The browser needs
network access to query Open-Meteo. Set `FLASK_DEBUG=true` only for local
development; debug mode is disabled by default.

import time
import itertools

tasks = [
    "Improve AQI calculations and validation.",
    "Add better API error handling.",
    "Improve Flask backend performance.",
    "Add a loading animation to the UI.",
    "Improve mobile responsiveness.",
    "Add AQI history tracking.",
    "Improve weather data presentation.",
    "Add input validation.",
    "Improve dashboard accessibility.",
    "Add better error messages."
]

print("AIR AWARE DEVELOPMENT ASSISTANT")
print("New development suggestion every 3 minutes.")
print("Press CTRL+C to stop.")

for task in itertools.cycle(tasks):
    time.sleep(180)

    print("\n" + "=" * 40)
    print("NEW AIR AWARE TASK")
    print("=" * 40)
    print(task)
    print("Review and implement this feature!")

import speech_recognition as sr
import webbrowser
import time


def open_youtube():
    """Open YouTube in the default web browser."""
    webbrowser.open("ENTER URL OF THE WEBSITE ", new=2)  # Opens in a new tab, if possible


def listen_for_help():
    """Continuously listen for the word 'help' and open YouTube when detected."""
    recognizer = sr.Recognizer()

    with sr.Microphone() as source:
        # Adjust to background noise for a longer time (e.g., 2 seconds)
        print("Calibrating for background noise. Please wait...")
        recognizer.adjust_for_ambient_noise(source, duration=2)

        # Set a higher threshold if needed (optional)
        recognizer.energy_threshold = max(400, recognizer.energy_threshold)

        print("Listening for 'help'...")


        try:
            with sr.Microphone() as source:
                # Listen for a short duration to avoid capturing background noise
                audio = recognizer.listen(source, timeout=5, phrase_time_limit=5)

                # Recognize the speech
                command = recognizer.recognize_google(audio).lower()
                print(f"You said: {command}")

                # If the command contains 'help', open YouTube
                if "help" in command:
                    print("Opening YouTube...")
                    open_youtube()
                    time.sleep(2)  # Optional: small delay before listening again

        except sr.UnknownValueError:
            # If the recognizer does not understand the audio, it will skip and listen again
            open_youtube()
            time.sleep(2)

        except sr.RequestError:
            # If there was an issue with the speech recognition service
            print("There was an issue with the speech recognition service.")

        except sr.WaitTimeoutError:
            print("Listening timed out. Trying again...")



if __name__ == "__main__":
    listen_for_help()

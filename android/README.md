# Öffi-Matrix Android-App

Die Android-App zeigt die vorhandene Weboberfläche lokal in einer WebView an. `index.html` und `stops.js` werden beim Build direkt aus dem Projektstamm in die App-Assets kopiert. Ein Node.js-Server wird auf dem Handy nicht benötigt.

Für Live-Abfahrten braucht das Handy eine Internetverbindung zu Transitous. Die Haltestellensuche und die Oberfläche selbst sind in der App enthalten. Die Android-App verwendet `WebViewAssetLoader`, damit das lokale Modul `stops.js` unter einem sicheren HTTPS-App-Origin geladen wird.

## APK in Android Studio bauen

1. Android Studio öffnen und den Ordner `android` als Projekt laden.
2. Als Gradle-JDK JDK 17 auswählen und Android SDK Platform 35 installieren. Benötigte Build Tools installiert Gradle automatisch.
3. Gradle-Synchronisierung abwarten und im Build-Menü **Build APK(s)** auswählen. Alternativ im Terminal im Ordner `android` `.\gradlew.bat assembleDebug` ausführen.
4. Die installierbare Debug-APK liegt danach unter `app/build/outputs/apk/debug/app-debug.apk`.

Die Debug-APK ist für die private Installation auf dem eigenen Gerät gedacht. Eine Release-APK zum Weitergeben müsste separat signiert werden.

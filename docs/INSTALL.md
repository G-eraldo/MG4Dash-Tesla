# Installation et retour arrière — procédure différée

**Aucune commande ADB d'installation ou de bascule HOME n'a été lancée.** L'APK `dist/MG4Dash-1.7.1-beta19-mg4custom1.apk` est le fork complet signé avec la clé de test plateforme décrite par l'amont. Il reprend le package `app.mg4dash` et `android.uid.system` ; il ne peut pas être installé à côté de MG4Dash officiel comme seconde application. La compatibilité de cette signature avec le véhicule particulier et le `versionCode` déjà installé restent à mesurer.

## Contrôles avant installation, avec véhicule à l'arrêt et accord distinct

1. Vérifier sur l'écran SAIC la version exacte SWI69 R45, puis relever sans modification `adb shell getprop ro.build.fingerprint` et `adb shell dumpsys package app.mg4dash` pour connaître version, signature et état installé. Ne pas tenter de mise à jour si la signature diffère ou si le `versionCode` installé est supérieur ou égal à 232 sans plan de migration explicite.
2. Prévoir un retour vérifié à l'accueil MG et une copie de l'APK précédent. Vérifier la présence de Rescue et que le mode maintenance fonctionne avant toute bascule d'accueil.
3. Comparer l'empreinte SHA-256 publiée dans `TESTING.md` avec le fichier local. Contrôler `apksigner verify --print-certs` et le certificat `keys/platform.x509.pem`.
4. Après accord d'installation seulement, suivre la séquence amont : `adb push dist/MG4Dash-1.7.1-beta19-mg4custom1.apk /data/local/tmp/x.apk`, puis `adb shell pm install -r -f /data/local/tmp/x.apk`, et enfin supprimer `/data/local/tmp/x.apk`. Une erreur de signature/UID impose l'arrêt ; ne pas désinstaller l'app officielle pour contourner l'erreur.
5. Lancer seulement `adb shell am start -n app.mg4dash/.MainActivity`. Tester le thème et les pages sans sélectionner « Replace SAIC home ». Vérifier la déconnexion caradapter et le retour à l'accueil MG. La bascule HOME constitue une décision ultérieure distincte.

Le bouton amont « Maintenance mode » réactive l'accueil SAIC. Le garde crash et Rescue sont conservés, mais leur comportement sur R45 n'est pas prouvé par compilation. La désinstallation directe d'un launcher actif est déconseillée ; utiliser d'abord le mode maintenance. Les instructions amont complètes demeurent dans le `README.md`.

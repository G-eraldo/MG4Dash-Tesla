# Installation différée — SWI69 R45

**Aucune installation ni bascule HOME n’a été lancée.** L’APK actuel est [MG4Dash-1.7.1-beta19-mg4custom3.apk](https://github.com/G-eraldo/MG4Dash-Tesla/releases/download/mg4custom3/MG4Dash-1.7.1-beta19-mg4custom3.apk), construit depuis le fork complet. `dist/` n’est pas versionné. GitHub distribue l’APK via sa release ; l’installation de MG4Dash sur l’autoradio suit la procédure ADB de l’amont.

L’APK actuel garde `app.mg4dash` et `android.uid.system`, avec `versionCode` 233 et le certificat plateforme de test AOSP SHA-256 `c8a2e9bccf597c2fb6dc66bee293fc13f2fc47ec77bc6b2b0d52c11f51192ab8`. Il ne peut pas être installé en parallèle de MG4Dash officiel. Une signature différente de celle déjà installée provoquera normalement un refus : ne pas désinstaller une application système pour le contourner. L’empreinte SHA-256 du fichier à utiliser est `e00a86373fac2811804f1b43525a94e8d645d24bdac4a9244edf3e56685f1418`.

## Préparation en lecture seule

Voiture immobilisée, confirmer SWI69 R45 à l’écran. Depuis l’ordinateur connecté en ADB, `adb devices` doit afficher un appareil à l’état `device`. Relever ensuite `adb shell getprop ro.build.fingerprint` et `adb shell dumpsys package app.mg4dash`. Comparer les informations de l’application éventuelle avec le paquet, la version et le certificat de cet APK. Si une version supérieure à 233 est déjà présente ou si la signature ne correspond pas, arrêter la procédure et préparer un plan de mise à jour adapté.

## Premier essai, seulement après accord d’installation

La séquence amont est `adb push MG4Dash-1.7.1-beta19-mg4custom3.apk /data/local/tmp/x.apk`, puis `adb shell pm install -r -f /data/local/tmp/x.apk`. Attendre `Success`. Supprimer ensuite le fichier temporaire avec `adb shell rm /data/local/tmp/x.apk`. Au moindre refus de signature, d’UID ou de version, s’arrêter. Lancer `adb shell am start -n app.mg4dash/.MainActivity` sans sélectionner « Replace SAIC home ».

Vérifier d’abord les deux vues, les données, les commandes et les autres pages à l’arrêt. Tester le retour à l’accueil MG. La bascule vers MG4Dash comme accueil, puis Maintenance Mode et Rescue, constituent une phase distincte après ces contrôles. Voir [les vérifications détaillées](TESTING.md) et le README amont pour les prérequis et la récupération.

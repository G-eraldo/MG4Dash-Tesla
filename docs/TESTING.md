# Vérifications — accueil Tesla, 1 novembre 2026

## Sur ordinateur

- Base : fork GitHub `G-eraldo/MG4Dash-Tesla`, commit `26fbd1e` ; variante voiture `app:carRelease`, `versionCode` 233, `versionName` `1.7.1-beta19-mg4custom3`.
- `:app:assembleCarRelease :app:testEmulatorDebugUnitTest` : compilation réussie, 90 tests Android JVM existants réussis, aucun échec. Un test ciblé supplémentaire de `MainActivity` et de la couche de carte native a réussi. `node --test tests/custom-state.test.js tests/custom-home.test.js` : 7 tests réussis, dont les transitions arrêt / marche et la déconnexion.
- Captures locales de l’interface à 1920×720 et 1280×480 avec données simulées : les deux vues restent lisibles. Ces captures ne prouvent pas le rendu de la WebView de la MG4 ni l’intégration de la carte native sur l’autoradio.
- `lintVital` : 0 erreur, 1 avertissement préexistant dans `Updater.kt` sur un `PendingIntent`.
- APK signé : `dist/MG4Dash-1.7.1-beta19-mg4custom3.apk`, signature v2 vérifiée, certificat SHA-256 `c8a2e9bccf597c2fb6dc66bee293fc13f2fc47ec77bc6b2b0d52c11f51192ab8`. Le manifeste compilé contient `app.mg4dash`, `android.uid.system`, API minimale 28, `MainActivity` HOME et les permissions système du fork. L’APK contient `assets/rescue.apk` et les nouveaux fichiers d’accueil.
- Empreinte SHA-256 de cet APK : `e00a86373fac2811804f1b43525a94e8d645d24bdac4a9244edf3e56685f1418`.

## À valider sur SWI69 R45, à l’arrêt

1. Version exacte de l’autoradio, état d’ADB, version et certificat éventuels de `app.mg4dash`. Si la signature installée diffère, l’installation de mise à jour doit être abandonnée sans désinstaller l’application existante.
2. Lancement manuel sans remplacer l’accueil SAIC ; vérifier l’ouverture des pages MG4Dash, le retour à l’accueil MG, et l’absence de blocage après fermeture ou redémarrage.
3. Comparer vitesse, batterie, autonomie, consommation, puissance, température, média et modes climatisation aux indications de la voiture. Vérifier les valeurs absentes et la déconnexion du service.
4. Tester la carte réelle, le suivi GPS, l’application de navigation configurée, le guidage DiAuto si utilisé, et les huit raccourcis configurés. Les commandes de climatisation et Home Assistant doivent être essayées délibérément, véhicule immobilisé.
5. Vérifier la transition graphique arrêt / marche, la lisibilité, les zones tactiles et le fonctionnement de Maintenance Mode et Rescue avant d’envisager une bascule de l’accueil SAIC. Leur fonctionnement sur R45 n’est pas prouvé par les tests sur ordinateur.

Aucun essai ni installation n’a été réalisé sur la voiture.

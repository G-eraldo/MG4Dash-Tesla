# Vérifications du fork — 1 novembre 2026

## Sur ordinateur

- Base MG4Dash `5cf74ee7f59547a66a38ecc9aaf09021da302038`. Variantes `car` et `emulator` compilées avec JDK 17, Android SDK 34 et Gradle 8.11.1. Le paquet voiture est un APK du module `app`, pas le module de démonstration abandonné.
- `node --test tests/custom-state.test.js` : 4 tests réussis pour état One Pedal, valeurs absentes, préférence et refus de commandes domestiques en état incertain.
- `:app:testEmulatorDebugUnitTest` : résultat final ci-dessous ; la première exécution a détecté une régression `updatePromptSurvivesRecreate`, corrigée avant la livraison.
- Le manifeste compilé contient `app.mg4dash`, `android.uid.system`, `minSdk 28`, `targetSdk 28`, `MainActivity` HOME/LAUNCHER et les permissions système de l'amont. L'APK contient `assets/rescue.apk` et `assets/mg4custom/*`. Aucune activité indépendante Custom n'est déclarée.
- Certificat de la clé AOSP téléchargée conforme au certificat `keys/platform.x509.pem` par comparaison de la clé publique SHA-256 (`3d3df7dc9bf26e02d4cd76256d41d45e41a4dedebe7feb95c40e3697681be8a7`). Signature APK et hash final ci-dessous.
- Aucun émulateur Android ni écran MG connecté : rendu WebView, commandes SAIC et services système non testés en exécution. Les tests Robolectric sont des tests sur JVM, sans matériel.

## À valider sur SWI69 R45 avant remplacement d'accueil

1. Version firmware exacte, certificat de la plateforme et `versionCode` déjà installé ; installation par mise à jour seulement si compatibles.
2. Lancement manuel et retour à l'accueil MG ; Rescue présent, mode maintenance accessible, comportement de récupération après crash contrôlé sans provoquer de panne en conduite.
3. Vitesse, batterie, autonomie, état One Pedal et aide de voie : comparer les lectures aux instruments et aux réglages MG à l'arrêt, vérifier valeurs nulles et déconnexion. Aucun setter One Pedal/ADAS pendant cette phase.
4. Climatisation, énergie, média, navigation, téléphone et applications : ouvrir les pages existantes, vérifier les contrôles avec véhicule immobilisé. Tester le raccourci vers les réglages SAIC depuis la page Véhicule et confirmer que la page de maintien de voie officielle existe sur R45.
5. Vérifier lisibilité 1920×720, zones tactiles, thème jour/nuit, persistance de la préférence One Pedal après redémarrage, sans activation automatique. Vérifier le comportement sans connexion `caradapter` et sans réseau.
6. Après ces vérifications et un nouvel accord explicite seulement, envisager « Replace SAIC home », puis tester Maintenance Mode et Rescue comme retour arrière.

## Résultat final

Build final `:app:assembleCarRelease :app:testEmulatorDebugUnitTest` réussi : 90 tests Android réussis, 0 échec ; 4 tests JavaScript réussis. Lint vital : 0 erreur, 1 avertissement amont sur le flag de mutabilité de `PendingIntent` dans `Updater.kt` (cible Android 9). APK signé et vérifié par `apksigner` avec schéma v2 ; certificat SHA-256 `c8a2e9bccf597c2fb6dc66bee293fc13f2fc47ec77bc6b2b0d52c11f51192ab8`. APK : `dist/MG4Dash-1.7.1-beta19-mg4custom1.apk`, SHA-256 `9c29107d111195f9ab36729fd743ba7ddf88b114b28639809af3ff159926acf0`. Aucune installation sur véhicule.

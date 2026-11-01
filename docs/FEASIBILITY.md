# Audit ciblé et faisabilité — 1 novembre 2026

Base MG4Dash : commit `5cf74ee7f59547a66a38ecc9aaf09021da302038`, GPL-3.0 ou ultérieure. MG4Control consulté en lecture seule à `f3e3f3d07b559c2168eb0bc5bc6b1779def492b0`, sans copie de code. La documentation publique SWI69 associe R45 à MCU 69.5.1.0, sans prouver la compatibilité de cette APK.

| Domaine | Mécanisme amont réutilisé | Limite actuelle |
|---|---|---|
| Données véhicule | `CarBridge`, `VehicleState`, `com.saicmotor.caradapter` | API et fraîcheur des mesures non vérifiées sur R45 |
| One Pedal | Lecture `VehicleState.onePedal` | Disponibilité distincte inconnue ; aucune activation automatique |
| Maintien de voie | Lecture `lasMode`, `Apps.VEHICLE` | L’écran officiel exact doit être confirmé sur R45 ; aucune écriture ADAS |
| Climatisation et énergie | Pages natives MG4Dash | Commandes existantes non testées sur ce véhicule |
| Média | `MediaHub` et pages natives | Sources SAIC et sessions à tester |
| Navigation | Liste d’applications et composants MG4Dash | Pas de carte interactive dans le nouveau thème |
| Home Assistant | Fonctions amont conservées | Le thème n’expose pas les actions garage/portail en accès direct |
| Accueil et récupération | `HomeSwitcher`, Maintenance Mode, Rescue, garde crash | À valider après installation volontaire, sans bascule HOME initiale |

Le package et l’UID système sont ceux de MG4Dash officiel. Il ne peut pas coexister sous un autre identifiant. Une mise à jour `-r` exige une signature compatible et un `versionCode` supérieur à l’APK en place. La clé AOSP de test utilisée par l’amont doit être vérifiée face à la signature de l’appareil avant installation.

# Sécurité et limites

- Le thème ne fait aucune commande One Pedal ou ADAS. La préférence One Pedal n’est qu’un rappel. Les conditions de disponibilité restent gérées par le véhicule et la page MG4Dash existante.
- Le raccourci vers les réglages MG passe par la page Véhicule amont. L’utilisateur doit être à l’arrêt avant d’ouvrir les réglages ; aucune disponibilité ou immobilisation n’est inférée à partir de données potentiellement périmées.
- Les lignes de la scène routière et la silhouette sont décoratives. Elles n’indiquent ni voie détectée ni pilotage. Le combiné MG reste la référence.
- La WebView charge uniquement les assets locaux ; chargement réseau, accès aux fichiers généraux et navigation hors page sont bloqués. Le pont expose une liste fermée de pages et les commandes média déjà présentes dans l’amont.
- Les services véhicule, Home Assistant et les permissions amont subsistent ; l’audit n’est pas une certification complète de ces chemins. Les raccourcis HA d’ouverture restent disponibles dans l’interface amont mais ne sont pas mis en avant dans le thème. Le stockage du jeton HA et HTTP éventuel sont des risques amont à examiner avant configuration.
- Les données `VehicleState` peuvent être absentes ou anciennes selon le repli amont. La vue affiche « — » à la déconnexion, mais la fraîcheur par champ n’est pas prouvée.
- Aucun essai sur le véhicule, bascule HOME, action de service, flash ou modification firmware n’a été effectué.

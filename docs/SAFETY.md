# Sécurité et limites du nouvel accueil

- Le passage arrêt / marche est une présentation basée sur la vitesse, pas une lecture du rapport P/D. Les images de voie et de route sont décoratives, sans détection de voie ni aide à la conduite. Le combiné MG reste la référence.
- La climatisation utilise les commandes existantes de `CarBridge` et les boutons sont inactifs si l’état nécessaire est inconnu. Aucune commande One Pedal ou ADAS n’a été ajoutée.
- Les raccourcis affichent les cases réellement configurées dans MG4Dash. Une case Home Assistant peut commander un équipement de maison d’un seul appui, conformément au fonctionnement existant. À configurer et essayer à l’arrêt ; l’écran ne confirme pas l’état physique de l’équipement.
- La carte OpenStreetMap native ne s’affiche que si la position est disponible. Le dessin en dessous n’est qu’un décor. Les indications de virage ne s’affichent que si DiAuto fournit un guidage ; les autres applications de navigation peuvent ne pas transmettre ces données.
- La WebView charge seulement ses fichiers locaux ; la carte native et les autres services MG4Dash gardent leur accès réseau habituel. Les données véhicule peuvent manquer ou être anciennes suivant les services SAIC. Les champs absents affichent « — ».
- Aucune commande ADB d’installation, bascule de l’accueil, action sur le véhicule, flash ou modification de firmware n’a été exécutée pour cette révision. La signature et les services sur SWI69 R45 restent à vérifier avant tout essai.

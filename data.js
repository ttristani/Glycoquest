// =====================================================================
// GlycoQuest — données intégrées (aliments, conseils, quiz, défis)
// Tout est modifiable ici sans toucher au reste de l'app.
// =====================================================================

// Base d'aliments : glucides (g) pour UNE portion indiquée.
// ig : "b" = index glycémique bas, "m" = moyen, "h" = élevé
// tags : leg = légume, pro = protéine, fib = riche en fibres, sucre = sucre ajouté
const FOODS = [
  // --- Féculents & céréales
  { id: "pain_blanc", nom: "Pain blanc / baguette", emoji: "🥖", cat: "Féculents", portion: "1/4 de baguette", g: 28, ig: "h", tags: [] },
  { id: "pain_complet", nom: "Pain complet / aux céréales", emoji: "🍞", cat: "Féculents", portion: "2 tranches", g: 25, ig: "m", tags: ["fib"] },
  { id: "biscottes", nom: "Biscottes", emoji: "🍘", cat: "Féculents", portion: "3 biscottes", g: 21, ig: "h", tags: [] },
  { id: "riz_blanc", nom: "Riz blanc", emoji: "🍚", cat: "Féculents", portion: "1 assiette (150 g cuit)", g: 42, ig: "h", tags: [] },
  { id: "riz_complet", nom: "Riz complet / basmati", emoji: "🍚", cat: "Féculents", portion: "1 assiette (150 g cuit)", g: 35, ig: "m", tags: ["fib"] },
  { id: "pates", nom: "Pâtes al dente", emoji: "🍝", cat: "Féculents", portion: "1 assiette (150 g cuit)", g: 40, ig: "m", tags: [] },
  { id: "pates_completes", nom: "Pâtes complètes", emoji: "🍝", cat: "Féculents", portion: "1 assiette (150 g cuit)", g: 37, ig: "b", tags: ["fib"] },
  { id: "pdt", nom: "Pommes de terre vapeur", emoji: "🥔", cat: "Féculents", portion: "2 moyennes (200 g)", g: 34, ig: "h", tags: [] },
  { id: "puree", nom: "Purée", emoji: "🥣", cat: "Féculents", portion: "1 assiette (200 g)", g: 30, ig: "h", tags: [] },
  { id: "frites", nom: "Frites", emoji: "🍟", cat: "Féculents", portion: "1 portion (150 g)", g: 50, ig: "h", tags: [] },
  { id: "semoule", nom: "Semoule", emoji: "🥣", cat: "Féculents", portion: "1 assiette (150 g cuit)", g: 35, ig: "m", tags: [] },
  { id: "quinoa", nom: "Quinoa", emoji: "🌾", cat: "Féculents", portion: "1 assiette (150 g cuit)", g: 30, ig: "b", tags: ["fib", "pro"] },
  { id: "lentilles", nom: "Lentilles", emoji: "🫘", cat: "Féculents", portion: "1 assiette (150 g cuit)", g: 25, ig: "b", tags: ["fib", "pro"] },
  { id: "pois_chiches", nom: "Pois chiches", emoji: "🫘", cat: "Féculents", portion: "1 assiette (150 g cuit)", g: 27, ig: "b", tags: ["fib", "pro"] },
  { id: "haricots_rouges", nom: "Haricots rouges / blancs", emoji: "🫘", cat: "Féculents", portion: "1 assiette (150 g cuit)", g: 22, ig: "b", tags: ["fib", "pro"] },
  { id: "avoine", nom: "Flocons d'avoine", emoji: "🥣", cat: "Féculents", portion: "4 c. à soupe (40 g)", g: 24, ig: "b", tags: ["fib"] },
  { id: "cereales", nom: "Céréales du petit-déj", emoji: "🥣", cat: "Féculents", portion: "1 bol (40 g)", g: 32, ig: "h", tags: ["sucre"] },
  { id: "croissant", nom: "Croissant", emoji: "🥐", cat: "Féculents", portion: "1 croissant", g: 26, ig: "h", tags: [] },
  { id: "pain_choc", nom: "Pain au chocolat", emoji: "🥐", cat: "Féculents", portion: "1 pièce", g: 30, ig: "h", tags: ["sucre"] },

  // --- Légumes
  { id: "salade", nom: "Salade verte", emoji: "🥬", cat: "Légumes", portion: "1 bol", g: 2, ig: "b", tags: ["leg", "fib"] },
  { id: "haricots_verts", nom: "Haricots verts", emoji: "🫛", cat: "Légumes", portion: "1 assiette (200 g)", g: 6, ig: "b", tags: ["leg", "fib"] },
  { id: "brocolis", nom: "Brocolis / chou-fleur", emoji: "🥦", cat: "Légumes", portion: "1 assiette (200 g)", g: 5, ig: "b", tags: ["leg", "fib"] },
  { id: "courgettes", nom: "Courgettes / aubergines", emoji: "🥒", cat: "Légumes", portion: "1 assiette (200 g)", g: 5, ig: "b", tags: ["leg", "fib"] },
  { id: "tomates", nom: "Tomates / crudités", emoji: "🍅", cat: "Légumes", portion: "1 assiette", g: 4, ig: "b", tags: ["leg", "fib"] },
  { id: "carottes", nom: "Carottes cuites", emoji: "🥕", cat: "Légumes", portion: "1 assiette (200 g)", g: 12, ig: "m", tags: ["leg", "fib"] },
  { id: "ratatouille", nom: "Ratatouille / poêlée", emoji: "🍆", cat: "Légumes", portion: "1 assiette (200 g)", g: 10, ig: "b", tags: ["leg", "fib"] },
  { id: "soupe", nom: "Soupe de légumes", emoji: "🍲", cat: "Légumes", portion: "1 bol", g: 10, ig: "b", tags: ["leg", "fib"] },
  { id: "epinards", nom: "Épinards / poireaux", emoji: "🥬", cat: "Légumes", portion: "1 assiette (200 g)", g: 4, ig: "b", tags: ["leg", "fib"] },
  { id: "champignons", nom: "Champignons", emoji: "🍄", cat: "Légumes", portion: "1 assiette", g: 1, ig: "b", tags: ["leg", "fib"] },
  { id: "petits_pois", nom: "Petits pois", emoji: "🫛", cat: "Légumes", portion: "1 assiette (150 g)", g: 15, ig: "m", tags: ["leg", "fib"] },
  { id: "mais", nom: "Maïs", emoji: "🌽", cat: "Légumes", portion: "1/2 boîte (100 g)", g: 20, ig: "m", tags: [] },

  // --- Protéines
  { id: "poulet", nom: "Poulet / dinde", emoji: "🍗", cat: "Protéines", portion: "1 filet", g: 0, ig: "b", tags: ["pro"] },
  { id: "poisson", nom: "Poisson blanc", emoji: "🐟", cat: "Protéines", portion: "1 filet", g: 0, ig: "b", tags: ["pro"] },
  { id: "saumon", nom: "Saumon / sardines / maquereau", emoji: "🐟", cat: "Protéines", portion: "1 portion", g: 0, ig: "b", tags: ["pro"] },
  { id: "boeuf", nom: "Steak / bœuf / veau", emoji: "🥩", cat: "Protéines", portion: "1 portion", g: 0, ig: "b", tags: ["pro"] },
  { id: "porc", nom: "Porc / côtelette", emoji: "🥩", cat: "Protéines", portion: "1 portion", g: 0, ig: "b", tags: ["pro"] },
  { id: "oeufs", nom: "Œufs", emoji: "🥚", cat: "Protéines", portion: "2 œufs", g: 1, ig: "b", tags: ["pro"] },
  { id: "jambon", nom: "Jambon blanc", emoji: "🥓", cat: "Protéines", portion: "2 tranches", g: 1, ig: "b", tags: ["pro"] },
  { id: "tofu", nom: "Tofu", emoji: "🧈", cat: "Protéines", portion: "1 portion (100 g)", g: 2, ig: "b", tags: ["pro"] },
  { id: "crevettes", nom: "Crevettes / fruits de mer", emoji: "🦐", cat: "Protéines", portion: "1 portion", g: 1, ig: "b", tags: ["pro"] },

  // --- Produits laitiers
  { id: "yaourt", nom: "Yaourt nature", emoji: "🥛", cat: "Laitages", portion: "1 pot", g: 6, ig: "b", tags: ["pro"] },
  { id: "fromage_blanc", nom: "Fromage blanc / skyr", emoji: "🥛", cat: "Laitages", portion: "1 pot (100 g)", g: 4, ig: "b", tags: ["pro"] },
  { id: "yaourt_fruits", nom: "Yaourt aux fruits / sucré", emoji: "🍓", cat: "Laitages", portion: "1 pot", g: 18, ig: "m", tags: ["sucre"] },
  { id: "fromage", nom: "Fromage", emoji: "🧀", cat: "Laitages", portion: "1 part (30 g)", g: 0, ig: "b", tags: ["pro"] },
  { id: "lait", nom: "Lait", emoji: "🥛", cat: "Laitages", portion: "1 verre (200 ml)", g: 10, ig: "b", tags: [] },

  // --- Fruits
  { id: "pomme", nom: "Pomme", emoji: "🍎", cat: "Fruits", portion: "1 moyenne", g: 18, ig: "b", tags: ["fib"] },
  { id: "poire", nom: "Poire", emoji: "🍐", cat: "Fruits", portion: "1 moyenne", g: 20, ig: "b", tags: ["fib"] },
  { id: "orange", nom: "Orange / clémentines", emoji: "🍊", cat: "Fruits", portion: "1 orange ou 2 clém.", g: 15, ig: "b", tags: ["fib"] },
  { id: "banane", nom: "Banane", emoji: "🍌", cat: "Fruits", portion: "1 moyenne", g: 25, ig: "m", tags: [] },
  { id: "fraises", nom: "Fraises / framboises", emoji: "🍓", cat: "Fruits", portion: "1 bol", g: 9, ig: "b", tags: ["fib"] },
  { id: "raisin", nom: "Raisin", emoji: "🍇", cat: "Fruits", portion: "1 grappe (150 g)", g: 25, ig: "m", tags: [] },
  { id: "kiwi", nom: "Kiwi", emoji: "🥝", cat: "Fruits", portion: "2 kiwis", g: 18, ig: "b", tags: ["fib"] },
  { id: "melon", nom: "Melon / pastèque", emoji: "🍉", cat: "Fruits", portion: "1 tranche", g: 12, ig: "h", tags: [] },
  { id: "compote", nom: "Compote sans sucre ajouté", emoji: "🍏", cat: "Fruits", portion: "1 pot", g: 15, ig: "m", tags: [] },
  { id: "fruits_secs", nom: "Fruits secs (dattes, raisins)", emoji: "🌰", cat: "Fruits", portion: "1 poignée", g: 20, ig: "m", tags: [] },
  { id: "noix", nom: "Noix / amandes", emoji: "🥜", cat: "Fruits", portion: "1 poignée", g: 3, ig: "b", tags: ["fib", "pro"] },

  // --- Sucré
  { id: "gateau", nom: "Gâteau / pâtisserie", emoji: "🍰", cat: "Sucré", portion: "1 part", g: 35, ig: "h", tags: ["sucre"] },
  { id: "tarte", nom: "Tarte aux fruits", emoji: "🥧", cat: "Sucré", portion: "1 part", g: 35, ig: "h", tags: ["sucre"] },
  { id: "glace", nom: "Glace", emoji: "🍨", cat: "Sucré", portion: "2 boules", g: 25, ig: "m", tags: ["sucre"] },
  { id: "biscuits", nom: "Biscuits", emoji: "🍪", cat: "Sucré", portion: "3 biscuits", g: 20, ig: "h", tags: ["sucre"] },
  { id: "choco_noir", nom: "Chocolat noir (70 %+)", emoji: "🍫", cat: "Sucré", portion: "2 carrés", g: 5, ig: "b", tags: [] },
  { id: "choco_lait", nom: "Chocolat au lait", emoji: "🍫", cat: "Sucré", portion: "2 carrés", g: 7, ig: "m", tags: ["sucre"] },
  { id: "confiture", nom: "Confiture / miel", emoji: "🍯", cat: "Sucré", portion: "1 c. à soupe", g: 15, ig: "h", tags: ["sucre"] },
  { id: "sucre", nom: "Sucre dans le café", emoji: "🧂", cat: "Sucré", portion: "1 morceau", g: 5, ig: "h", tags: ["sucre"] },

  // --- Boissons
  { id: "eau", nom: "Eau", emoji: "💧", cat: "Boissons", portion: "1 verre", g: 0, ig: "b", tags: [] },
  { id: "cafe", nom: "Café / thé sans sucre", emoji: "☕", cat: "Boissons", portion: "1 tasse", g: 0, ig: "b", tags: [] },
  { id: "jus", nom: "Jus de fruits", emoji: "🧃", cat: "Boissons", portion: "1 verre (200 ml)", g: 20, ig: "h", tags: ["sucre"] },
  { id: "soda", nom: "Soda", emoji: "🥤", cat: "Boissons", portion: "1 verre (250 ml)", g: 27, ig: "h", tags: ["sucre"] },
  { id: "soda_zero", nom: "Soda zéro / light", emoji: "🥤", cat: "Boissons", portion: "1 verre", g: 0, ig: "b", tags: [] },
  { id: "vin", nom: "Vin", emoji: "🍷", cat: "Boissons", portion: "1 verre", g: 1, ig: "b", tags: [] },
  { id: "biere", nom: "Bière", emoji: "🍺", cat: "Boissons", portion: "1 demi (25 cl)", g: 10, ig: "h", tags: [] },

  // --- Plats complets
  { id: "pizza", nom: "Pizza", emoji: "🍕", cat: "Plats", portion: "1/2 pizza", g: 55, ig: "h", tags: ["pro"] },
  { id: "quiche", nom: "Quiche / tarte salée", emoji: "🥧", cat: "Plats", portion: "1 part", g: 20, ig: "m", tags: ["pro"] },
  { id: "sandwich", nom: "Sandwich baguette", emoji: "🥪", cat: "Plats", portion: "1 sandwich", g: 50, ig: "h", tags: ["pro"] },
  { id: "couscous", nom: "Couscous", emoji: "🍲", cat: "Plats", portion: "1 assiette", g: 55, ig: "m", tags: ["pro", "leg"] },
  { id: "lasagnes", nom: "Lasagnes / gratin de pâtes", emoji: "🍝", cat: "Plats", portion: "1 part", g: 35, ig: "m", tags: ["pro"] },
  { id: "burger", nom: "Hamburger", emoji: "🍔", cat: "Plats", portion: "1 burger", g: 35, ig: "h", tags: ["pro"] },
  { id: "paella", nom: "Paella / riz cantonais", emoji: "🥘", cat: "Plats", portion: "1 assiette", g: 50, ig: "h", tags: ["pro"] },
  { id: "pot_au_feu", nom: "Pot-au-feu / blanquette", emoji: "🍲", cat: "Plats", portion: "1 assiette", g: 20, ig: "m", tags: ["pro", "leg"] },
];

const FOOD_CATS = ["Féculents", "Légumes", "Protéines", "Laitages", "Fruits", "Sucré", "Boissons", "Plats"];

// Conseils du jour. "glp1: true" = spécifique au traitement GLP-1.
const TIPS = [
  { t: "Commence ton repas par les légumes : leurs fibres freinent la montée du sucre dans le sang.", e: "🥗" },
  { t: "Une marche de 10 à 15 minutes après le repas aide les muscles à consommer le sucre du repas.", e: "🚶" },
  { t: "Avec le GLP-1, mange lentement et pose ta fourchette entre deux bouchées : tu sentiras plus vite que tu n'as plus faim.", e: "🐢", glp1: true },
  { t: "Le GLP-1 ralentit la digestion : des portions plus petites limitent les nausées.", e: "🍽️", glp1: true },
  { t: "Les repas très gras ou frits aggravent souvent les troubles digestifs sous GLP-1. Préfère la cuisson vapeur ou au four.", e: "🍳", glp1: true },
  { t: "Bois de l'eau régulièrement dans la journée, surtout en cas de nausées ou de diarrhée.", e: "💧", glp1: true },
  { t: "Mets une protéine à chaque repas (œuf, poisson, viande, yaourt, légumineuses) : ça protège tes muscles si tu perds du poids.", e: "💪", glp1: true },
  { t: "Note toujours le jour de ton injection : un stylo hebdomadaire s'oublie facilement. En cas d'oubli, suis la notice ou demande au pharmacien.", e: "📅", glp1: true },
  { t: "Change de zone d'injection à chaque fois (ventre, cuisse, bras) pour garder une peau souple.", e: "🔄", glp1: true },
  { t: "Garde tes stylos neufs au réfrigérateur, jamais au congélateur.", e: "❄️", glp1: true },
  { t: "Un fruit entier vaut mieux qu'un jus : les fibres ralentissent l'absorption du sucre.", e: "🍎" },
  { t: "Pâtes et riz al dente font moins monter la glycémie que bien cuits.", e: "🍝" },
  { t: "Les légumineuses (lentilles, pois chiches) sont des féculents champions : riches en fibres et en protéines.", e: "🫘" },
  { t: "Préfère le pain complet ou aux céréales au pain blanc.", e: "🍞" },
  { t: "Des féculents refroidis puis réchauffés (riz, pommes de terre) font un peu moins monter la glycémie.", e: "🧊" },
  { t: "Le dessert passe mieux à la fin du repas qu'en collation seul : le reste du repas freine son absorption.", e: "🍰" },
  { t: "Lis les étiquettes : le sucre se cache aussi sous les noms dextrose, sirop de glucose ou maltodextrine.", e: "🔍" },
  { t: "Regarde tes pieds chaque soir : une petite plaie non vue peut s'infecter avec le diabète.", e: "🦶" },
  { t: "Le fond d'œil est à faire régulièrement avec le diabète. Il est temps d'en reprendre un ?", e: "👁️" },
  { t: "Un bon sommeil aide aussi à mieux équilibrer la glycémie.", e: "😴" },
  { t: "Le stress fait monter le sucre. Trois grandes respirations lentes, ça compte aussi !", e: "🧘" },
  { t: "L'alcool se boit pendant un repas et avec modération, jamais à jeun.", e: "🍷" },
  { t: "Une glycémie ponctuelle haute n'est pas un échec : c'est une information. Regarde ce que tu as mangé avant.", e: "🧠" },
  { t: "Mesurer 2 h après un repas t'apprend comment ton corps réagit à ce plat précis.", e: "⏱️" },
  { t: "Monter les escaliers plutôt que l'ascenseur : chaque pas compte.", e: "🪜" },
  { t: "Le vinaigre dans la salade (vinaigrette maison) aide un peu à limiter le pic de sucre.", e: "🥗" },
  { t: "Les noix et amandes sont une bonne collation : peu de sucre, du bon gras, des protéines.", e: "🥜" },
  { t: "Prépare tes repas de la semaine à l'avance : moins de grignotage improvisé.", e: "📝" },
  { t: "Le jardinage, le bricolage et le ménage, c'est aussi de l'activité physique !", e: "🌱" },
  { t: "Si tu as faim entre les repas, prends un yaourt nature ou une poignée d'amandes plutôt que des biscuits.", e: "🥛" },
  { t: "Bien mâcher, c'est déjà commencer la digestion — et manger moins sans frustration.", e: "😋" },
  { t: "Parle à ton médecin de tes effets secondaires : le dosage du GLP-1 peut souvent être ajusté.", e: "👨‍⚕️", glp1: true },
  { t: "Apporte le rapport de l'app à ta prochaine consultation : ton médecin adorera les courbes.", e: "📊" },
];

// Quiz du jour : une question par jour.
const QUIZ = [
  { q: "Quel aliment fait le moins monter la glycémie ?", r: ["Riz blanc", "Lentilles", "Purée"], ok: 1, x: "Les lentilles ont un index glycémique bas grâce à leurs fibres et leurs protéines." },
  { q: "Quelle est la cible habituelle de glycémie à jeun pour un diabète de type 2 ?", r: ["0,80 à 1,30 g/L", "1,50 à 2,00 g/L", "0,40 à 0,70 g/L"], ok: 0, x: "En général 0,80 à 1,30 g/L, mais ta cible exacte se décide avec ton médecin." },
  { q: "Combien de temps après le début du repas mesure-t-on la glycémie « post-prandiale » ?", r: ["30 minutes", "2 heures", "5 heures"], ok: 1, x: "On mesure 2 heures après le début du repas." },
  { q: "Comment agit un traitement GLP-1 ?", r: ["Il remplace l'insuline", "Il ralentit la digestion et aide le pancréas", "Il élimine le sucre par les reins"], ok: 1, x: "Il stimule la sécrétion d'insuline quand le sucre monte, ralentit la vidange de l'estomac et diminue l'appétit." },
  { q: "Quel est l'effet secondaire le plus fréquent du GLP-1 au début ?", r: ["Les nausées", "La toux", "Les maux de dents"], ok: 0, x: "Les troubles digestifs (nausées surtout) sont fréquents au début et diminuent souvent avec le temps." },
  { q: "Un verre de jus d'orange contient à peu près autant de sucre que…", r: ["1 morceau de sucre", "4 morceaux de sucre", "Aucun sucre"], ok: 1, x: "Environ 20 g de glucides, soit 4 morceaux de sucre. Le fruit entier est bien meilleur." },
  { q: "Dans l'assiette idéale, quelle part doivent occuper les légumes ?", r: ["Un quart", "La moitié", "Rien du tout"], ok: 1, x: "La moitié de légumes, un quart de protéines, un quart de féculents." },
  { q: "Que faire en cas d'hypoglycémie (moins de 0,70 g/L) ?", r: ["Attendre le repas suivant", "Prendre 15 g de sucre rapide et recontrôler après 15 min", "Faire du sport"], ok: 1, x: "La règle des 15 : 15 g de sucre rapide (3 morceaux de sucre ou un petit verre de jus), puis recontrôle 15 minutes après." },
  { q: "Pourquoi changer de zone d'injection ?", r: ["Pour éviter les bosses sous la peau", "Pour que ça marche plus vite", "Ça n'a aucune importance"], ok: 0, x: "Piquer toujours au même endroit crée des boules de graisse (lipodystrophies) qui gênent l'absorption." },
  { q: "Quel pain choisir de préférence ?", r: ["Baguette blanche", "Pain de mie", "Pain complet ou aux céréales"], ok: 2, x: "Le pain complet contient plus de fibres et fait moins monter la glycémie." },
  { q: "Les pâtes font moins monter la glycémie quand elles sont…", r: ["Très cuites", "Al dente", "Mixées"], ok: 1, x: "Al dente, l'amidon est digéré plus lentement." },
  { q: "Où conserve-t-on un stylo GLP-1 neuf ?", r: ["Au congélateur", "Au réfrigérateur", "Au soleil"], ok: 1, x: "Au réfrigérateur entre 2 et 8 °C. Un stylo entamé peut souvent rester à température ambiante : vérifie la notice." },
  { q: "Que vérifier chaque jour quand on est diabétique ?", r: ["Ses pieds", "Ses cheveux", "Ses ongles de main"], ok: 0, x: "Le diabète peut diminuer la sensibilité des pieds : une petite plaie peut passer inaperçue." },
  { q: "Quelle collation est la plus adaptée ?", r: ["Une poignée d'amandes", "Un paquet de biscuits", "Une canette de soda"], ok: 0, x: "Les amandes contiennent très peu de sucre et beaucoup de fibres." },
  { q: "L'HbA1c (hémoglobine glyquée) reflète la glycémie moyenne sur…", r: ["La journée", "Les 2 à 3 derniers mois", "Les 5 dernières années"], ok: 1, x: "Elle reflète la moyenne des 2 à 3 derniers mois. On la mesure en général tous les 3 mois." },
  { q: "Marcher après un repas…", r: ["Fait monter la glycémie", "Aide à faire baisser la glycémie", "N'a aucun effet"], ok: 1, x: "Les muscles en mouvement consomment le sucre du repas." },
  { q: "Quel fruit a l'index glycémique le plus bas ?", r: ["Pastèque", "Pomme", "Dattes séchées"], ok: 1, x: "La pomme a un IG bas ; la pastèque et les dattes sont plus élevées." },
  { q: "Le stress peut-il augmenter la glycémie ?", r: ["Oui", "Non"], ok: 0, x: "Oui, les hormones du stress (cortisol, adrénaline) font monter le sucre." },
  { q: "Avec un GLP-1, que faire si on se sent vite rassasié ?", r: ["Se forcer à finir l'assiette", "S'arrêter de manger", "Boire un soda"], ok: 1, x: "C'est le médicament qui agit : écoute ta satiété et arrête-toi." },
  { q: "1,26 g/L, c'est combien en mg/dL ?", r: ["12,6 mg/dL", "126 mg/dL", "1 260 mg/dL"], ok: 1, x: "On multiplie par 100 : 1,26 g/L = 126 mg/dL." },
];

// Défis quotidiens. type "auto" = validé automatiquement par l'app, "manuel" = case à cocher.
// groupe : on tire un défi de chaque groupe chaque jour.
const CHALLENGES = [
  { id: "mesure_jeun", groupe: "mesure", type: "auto", e: "🩸", t: "Mesurer ta glycémie à jeun" },
  { id: "deux_mesures", groupe: "mesure", type: "auto", e: "📈", t: "Faire 2 mesures dans la journée" },
  { id: "mesure_apres", groupe: "mesure", type: "auto", e: "⏱️", t: "Mesurer 2 h après un repas" },
  { id: "repas_vert", groupe: "repas", type: "auto", e: "🟢", t: "Faire un repas noté vert" },
  { id: "deux_repas", groupe: "repas", type: "auto", e: "🍽️", t: "Noter 2 repas aujourd'hui" },
  { id: "legumes", groupe: "repas", type: "auto", e: "🥦", t: "Des légumes à 2 repas" },
  { id: "sans_sucre", groupe: "repas", type: "manuel", e: "🚫", t: "Aucune boisson sucrée aujourd'hui" },
  { id: "marche", groupe: "bouger", type: "manuel", e: "🚶", t: "Marcher 20 minutes" },
  { id: "marche_digest", groupe: "bouger", type: "manuel", e: "🌳", t: "10 minutes de marche après un repas" },
  { id: "escaliers", groupe: "bouger", type: "manuel", e: "🪜", t: "Prendre les escaliers" },
  { id: "eau", groupe: "bouger", type: "auto", e: "💧", t: "Boire 6 verres d'eau" },
  { id: "pieds", groupe: "bouger", type: "manuel", e: "🦶", t: "Vérifier tes pieds" },
  { id: "lent", groupe: "bouger", type: "manuel", e: "🐢", t: "Prendre 20 minutes pour manger le midi" },
];

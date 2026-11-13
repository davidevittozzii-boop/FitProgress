// ==================== DATABASE ESERCIZI ====================
const exerciseDB = [
    { category: "Petto", name: "Panca Piana Bilanciere", tech: "Scapole addotte. Piedi piantati a terra.", muscles: {'front-chest-lower': 3, 'front-chest-upper': 1, 'front-shoulder': 2, 'back-triceps': 2} },
    { category: "Petto", name: "Panca Inclinata Manubri", tech: "Panca a 30-45 gradi. Scapole addotte.", muscles: {'front-chest-upper': 3, 'front-chest-lower': 1, 'front-shoulder': 2, 'back-triceps': 1} },
    { category: "Petto", name: "Panca Declinata Bilanciere", tech: "Focus sulla parte bassa del petto.", muscles: {'front-chest-lower': 3, 'back-triceps': 2} },
    { category: "Petto", name: "Chest Press Inclinata 45°", tech: "Spingi avanti e in alto. Spalle basse.", muscles: {'front-chest-upper': 3, 'front-chest-lower': 1, 'front-shoulder': 2, 'back-triceps': 1} },
    { category: "Petto", name: "Chest Press (Piana)", tech: "Spalle incollate allo schienale.", muscles: {'front-chest-lower': 3, 'front-shoulder': 2, 'back-triceps': 1} },
    { category: "Petto", name: "Pectoral Machine (Croci)", tech: "Petto in fuori, spingi con i gomiti.", muscles: {'front-chest-lower': 3, 'front-chest-upper': 1, 'front-shoulder': 1} },
    { category: "Petto", name: "Croci panca piana manubri", tech: "Mantieni un leggero angolo sui gomiti.", muscles: {'front-chest-lower': 3, 'front-chest-upper': 1} },
    { category: "Petto", name: "Croci panca inclinata manubri", tech: "Massimo stiramento in discesa.", muscles: {'front-chest-upper': 3, 'front-shoulder': 1} },
    { category: "Petto", name: "Croci ai Cavi alti (dall'alto)", tech: "Incrocia i polsi in chiusura.", muscles: {'front-chest-lower': 3, 'front-abs': 1} },
    { category: "Petto", name: "Croci ai Cavi bassi (dal basso)", tech: "Tira verso l'alto. Focus petto clavicolare.", muscles: {'front-chest-upper': 3, 'front-shoulder': 2} },
    { category: "Petto", name: "Dip alle parallele (Focus Petto)", tech: "Busto flesso in avanti, gomiti larghi.", muscles: {'front-chest-lower': 3, 'back-triceps': 2, 'front-shoulder': 2} },
    { category: "Petto", name: "Push-up (Piegamenti a terra)", tech: "Core contratto, non inarcare la schiena.", muscles: {'front-chest-lower': 3, 'front-shoulder': 2, 'back-triceps': 2, 'front-abs': 1} },
    { category: "Petto", name: "Push-up declinati (Piedi rialzati)", tech: "Sposta il focus sul petto alto.", muscles: {'front-chest-upper': 3, 'front-shoulder': 2, 'back-triceps': 2} },
    { category: "Petto", name: "Pullover Manubrio", tech: "Panca di traverso, allunga bene indietro.", muscles: {'front-chest-lower': 2, 'back-lats': 2, 'back-triceps': 1} },

    { category: "Dorso e Lombari", name: "Trazioni alla Sbarra (Pronazione)", tech: "Presa larga. Mento oltre la sbarra.", muscles: {'back-lats': 3, 'back-traps': 2, 'front-biceps': 2, 'front-abs': 1} },
    { category: "Dorso e Lombari", name: "Trazioni Supine (Chin-up)", tech: "Presa stretta inversa.", muscles: {'back-lats': 3, 'front-biceps': 3, 'back-traps': 1} },
    { category: "Dorso e Lombari", name: "Lat Machine Avanti Prone", tech: "Tira la sbarra verso lo sterno.", muscles: {'back-lats': 3, 'back-traps': 1, 'front-biceps': 1} },
    { category: "Dorso e Lombari", name: "Lat Machine Presa Inversa", tech: "Tira con i gomiti stretti al corpo.", muscles: {'back-lats': 3, 'front-biceps': 2} },
    { category: "Dorso e Lombari", name: "Lat Machine Triangolo", tech: "Presa neutra stretta.", muscles: {'back-lats': 3, 'back-traps': 2, 'front-biceps': 1} },
    { category: "Dorso e Lombari", name: "Rematore Bilanciere", tech: "Schiena dritta, tira verso l'ombelico.", muscles: {'back-lats': 3, 'back-traps': 2, 'back-lowerback': 3, 'front-biceps': 1} },
    { category: "Dorso e Lombari", name: "Rematore Manubrio (Singolo)", tech: "Appoggio su panca. Gomito stretto.", muscles: {'back-lats': 3, 'back-traps': 1, 'front-biceps': 1} },
    { category: "Dorso e Lombari", name: "Pulley Basso (Triangolo)", tech: "Non fare oscillare la schiena.", muscles: {'back-traps': 3, 'back-lats': 2, 'front-biceps': 1, 'back-lowerback': 1} },
    { category: "Dorso e Lombari", name: "T-Bar Row (Rematore a T)", tech: "Contrazione di picco massima in alto.", muscles: {'back-traps': 3, 'back-lats': 2, 'back-lowerback': 2, 'front-biceps': 1} },
    { category: "Dorso e Lombari", name: "Vertical Row (Macchina)", tech: "Petto appoggiato, tira con i gomiti.", muscles: {'back-traps': 3, 'back-lats': 2, 'back-shoulder': 2} },
    { category: "Dorso e Lombari", name: "Pull-down braccia tese", tech: "Usa corda o sbarra. Schiena curva.", muscles: {'back-lats': 3, 'back-triceps': 1, 'front-abs': 1} },
    { category: "Dorso e Lombari", name: "Iperestensioni (Hyperextension)", tech: "Non inarcare troppo il collo in salita.", muscles: {'back-lowerback': 3, 'back-glutes': 2, 'back-hamstrings': 1} },
    { category: "Dorso e Lombari", name: "Good Morning", tech: "Gambe semi-tese, spingi i glutei indietro.", muscles: {'back-lowerback': 3, 'back-hamstrings': 3, 'back-glutes': 2} },

    { category: "Gambe", name: "Squat (Bilanciere libero)", tech: "Scendi sotto il parallelo. Petto in fuori.", muscles: {'front-quads': 3, 'back-glutes': 3, 'back-lowerback': 2, 'back-hamstrings': 1} },
    { category: "Gambe", name: "Front Squat", tech: "Bilanciere sulle clavicole. Busto drittissimo.", muscles: {'front-quads': 3, 'front-abs': 2, 'back-glutes': 1} },
    { category: "Gambe", name: "Hack Squat Macchina", tech: "Piedi centrati, spingi coi talloni.", muscles: {'front-quads': 3, 'back-glutes': 2} },
    { category: "Gambe", name: "Leg Press 45°", tech: "Non bloccare le ginocchia in estensione.", muscles: {'front-quads': 3, 'back-glutes': 2, 'back-hamstrings': 1} },
    { category: "Gambe", name: "Affondi Camminati (Manubri)", tech: "Passo lungo per i glutei, corto per i quad.", muscles: {'front-quads': 3, 'back-glutes': 3} },
    { category: "Gambe", name: "Affondi Bulgari", tech: "Piede posteriore su panca.", muscles: {'back-glutes': 3, 'front-quads': 3} },
    { category: "Gambe", name: "Leg Extension", tech: "Trattieni 1 secondo in massima contrazione.", muscles: {'front-quads': 3} },
    { category: "Gambe", name: "Sissy Squat", tech: "Tensione estrema sui quadricipiti.", muscles: {'front-quads': 3} },
    { category: "Gambe", name: "Stacchi da Terra (Deadlift)", tech: "Schiena neutra, bilanciere attaccato alle tibie.", muscles: {'back-lowerback': 3, 'back-glutes': 3, 'back-hamstrings': 3, 'back-traps': 2, 'front-quads': 1} },
    { category: "Gambe", name: "Stacchi Rumeni (RDL)", tech: "Gambe semi-tese, enfasi sull'allungamento.", muscles: {'back-hamstrings': 3, 'back-glutes': 3, 'back-lowerback': 2} },
    { category: "Gambe", name: "Leg Curl Seduto", tech: "Punta dei piedi a martello (dorsiflessione).", muscles: {'back-hamstrings': 3} },
    { category: "Gambe", name: "Leg Curl Disteso", tech: "Fase di discesa lenta e controllata.", muscles: {'back-hamstrings': 3, 'front-calves': 1} },
    { category: "Gambe", name: "Hip Thrust Bilanciere", tech: "Mento al petto, squeeze dei glutei di 2s.", muscles: {'back-glutes': 3, 'back-hamstrings': 1} },
    { category: "Gambe", name: "Slanci Posteriori", tech: "Gamba tesa indietro, non usare la schiena.", muscles: {'back-glutes': 3} },
    { category: "Gambe", name: "Adductor Machine (Chiusura)", tech: "Chiudi con decisione, apri lentamente.", muscles: {'front-adductors': 3} },
    { category: "Gambe", name: "Abductor Machine (Apertura)", tech: "Busto in avanti per maggiore enfasi sui glutei.", muscles: {'back-glutes': 3} },
    { category: "Gambe", name: "Calf Machine in Piedi", tech: "Massima escursione alla caviglia.", muscles: {'front-calves': 3, 'back-calves': 3} },
    { category: "Gambe", name: "Calf Machine Seduto", tech: "Attiva il soleo (polpaccio profondo).", muscles: {'front-calves': 3, 'back-calves': 3} },

    { category: "Spalle", name: "Lento Avanti Bilanciere (Military)", tech: "Core contratto, bilanciere sfiora il naso.", muscles: {'front-shoulder': 3, 'front-chest-upper': 1, 'back-triceps': 2, 'front-abs': 1} },
    { category: "Spalle", name: "Shoulder Press Manubri", tech: "Panca a 80°. Non toccare i manubri in alto.", muscles: {'front-shoulder': 3, 'back-triceps': 1} },
    { category: "Spalle", name: "Shoulder Press (Macchina)", tech: "Spingi forte, controlla la discesa.", muscles: {'front-shoulder': 3, 'back-triceps': 2} },
    { category: "Spalle", name: "Alzate Laterali Manubri", tech: "Mignolo leggermente ruotato verso l'alto.", muscles: {'front-shoulder': 3, 'back-shoulder': 2} },
    { category: "Spalle", name: "Alzate Laterali ai Cavi", tech: "Tensione costante per tutto il movimento.", muscles: {'front-shoulder': 3, 'back-shoulder': 2} },
    { category: "Spalle", name: "Alzate Frontali", tech: "Braccia quasi tese fino all'altezza occhi.", muscles: {'front-shoulder': 3, 'front-chest-upper': 1} },
    { category: "Spalle", name: "Alzate a 90° (Busto Flesso)", tech: "Focus deltoide posteriore.", muscles: {'back-shoulder': 3, 'back-traps': 1} },
    { category: "Spalle", name: "Pectoral Inversa (Rear Delt)", tech: "Gomiti alti e larghi, movimento scapolare.", muscles: {'back-shoulder': 3, 'back-traps': 2} },
    { category: "Spalle", name: "Face Pull (Corda ai cavi)", tech: "Tira verso gli occhi, apri i gomiti.", muscles: {'back-shoulder': 3, 'back-traps': 2, 'front-biceps': 1} },
    { category: "Spalle", name: "Scrollate (Shrugs)", tech: "Solleva le spalle verso le orecchie.", muscles: {'back-traps': 3} },

    { category: "Braccia", name: "Curl Bilanciere", tech: "Gomiti fermi lungo i fianchi. Non oscillare.", muscles: {'front-biceps': 3, 'front-forearm': 1} },
    { category: "Braccia", name: "Curl Manubri Alternato", tech: "Supinazione del polso durante la salita.", muscles: {'front-biceps': 3} },
    { category: "Braccia", name: "Curl a Martello (Hammer Curl)", tech: "Presa neutra. Focus sul brachiale.", muscles: {'front-biceps': 3, 'front-forearm': 3} },
    { category: "Braccia", name: "Curl Panca Inclinata Manubri", tech: "Massimo stretch in partenza.", muscles: {'front-biceps': 3} },
    { category: "Braccia", name: "Curl Concentrato", tech: "Gomito all'interno della coscia.", muscles: {'front-biceps': 3} },
    { category: "Braccia", name: "Curl ai Cavi (Basso)", tech: "Sbarra dritta o corda.", muscles: {'front-biceps': 3} },
    { category: "Braccia", name: "Push Down Tricipiti (Corda)", tech: "Allarga la corda in basso. Gomiti fissi.", muscles: {'back-triceps': 3} },
    { category: "Braccia", name: "Push Down Tricipiti (Sbarra)", tech: "Spinta decisa verso il basso.", muscles: {'back-triceps': 3} },
    { category: "Braccia", name: "French Press (Bilanciere EZ)", tech: "Porta la barra dietro la fronte.", muscles: {'back-triceps': 3} },
    { category: "Braccia", name: "French Press Manubri", tech: "Presa neutra, scendi di fianco alle orecchie.", muscles: {'back-triceps': 3} },
    { category: "Braccia", name: "Estensioni Dietro Nuca", tech: "Gomito punta al soffitto.", muscles: {'back-triceps': 3} },
    { category: "Braccia", name: "Kickback Tricipiti Manubrio", tech: "Busto flesso, estensione orizzontale.", muscles: {'back-triceps': 2} },
    { category: "Braccia", name: "Dip tra due panche", tech: "Schiena radente alla panca dietro.", muscles: {'back-triceps': 3, 'front-shoulder': 1} },
    { category: "Braccia", name: "Wrist Curl (Flessione Polsi)", tech: "Bilanciere o manubri, avambracci in appoggio.", muscles: {'front-forearm': 3} },

    { category: "Addome e Core", name: "Crunch a terra", tech: "Stacca solo le spalle da terra. Contrai forte.", muscles: {'front-abs': 3, 'front-abs-lower': 1} },
    { category: "Addome e Core", name: "Crunch alla Macchina", tech: "Incurva la colonna, non tirare di braccia.", muscles: {'front-abs': 3, 'front-abs-lower': 2} },
    { category: "Addome e Core", name: "Crunch ai Cavi (Rope)", tech: "In ginocchio, fronte verso il pavimento.", muscles: {'front-abs': 3, 'front-abs-lower': 2} },
    { category: "Addome e Core", name: "Leg Raise Sospensione", tech: "Gambe tese o piegate, arrotola il bacino in alto.", muscles: {'front-abs-lower': 3, 'front-abs': 2} },
    { category: "Addome e Core", name: "Leg Raise a Terra / Panca", tech: "Mani sotto i glutei. Non inarcare la schiena.", muscles: {'front-abs-lower': 3, 'front-abs': 1} },
    { category: "Addome e Core", name: "Russian Twist", tech: "Ruota bene il busto, segui il peso con lo sguardo.", muscles: {'front-obliques': 3, 'front-abs': 1} },
    { category: "Addome e Core", name: "Plank Tradizionale", tech: "Corpo in linea, glutei stretti, retroversione.", muscles: {'front-abs': 3, 'front-abs-lower': 3, 'back-lowerback': 1} },
    { category: "Addome e Core", name: "Plank Laterale", tech: "Spalla perpendicolare al gomito.", muscles: {'front-obliques': 3, 'front-abs': 1} },
    { category: "Addome e Core", name: "Ab Roller", tech: "Non cedere con la zona lombare in estensione.", muscles: {'front-abs': 3, 'front-abs-lower': 3, 'back-lowerback': 2, 'back-lats': 1} },
    { category: "Addome e Core", name: "Woodchopper (Cavi)", tech: "Movimento di taglio diagonale per gli obliqui.", muscles: {'front-obliques': 3, 'front-abs': 1, 'front-shoulder': 1} }
];

// ==================== 1. DATABASE PIATTI DI FAMIGLIA (TAGLIA M BASE) ====================
const homeFoodDB = [
    { cat: "Primi", name: "Pasta al Pomodoro e Basilico", desc: "Porzione media (~85g pasta cruda)", kcal: 390, p: 11, c: 68, f: 8 },
    { cat: "Primi", name: "Pasta al Ragù di Carne (Bolognese)", desc: "Porzione media con ragù casalingo", kcal: 490, p: 21, c: 66, f: 15 },
    { cat: "Primi", name: "Pasta alla Carbonara", desc: "Con guanciale, uova e pecorino", kcal: 580, p: 23, c: 64, f: 25 },
    { cat: "Primi", name: "Pasta al Pesto Genovese", desc: "Porzione media condita", kcal: 510, p: 13, c: 65, f: 22 },
    { cat: "Primi", name: "Pasta con Tonno", desc: "In bianco o al pomodoro", kcal: 460, p: 24, c: 65, f: 11 },
    { cat: "Primi", name: "Pasta e Fagioli / Ceci / Lenticchie", desc: "Scodella media mista", kcal: 420, p: 18, c: 64, f: 9 },
    { cat: "Primi", name: "Pasta in Bianco (Olio e Parmigiano)", desc: "Piatto medio semplice", kcal: 410, p: 14, c: 64, f: 11 },
    { cat: "Primi", name: "Lasagne alla Bolognese", desc: "Trancio medio casalingo", kcal: 560, p: 26, c: 48, f: 29 },
    { cat: "Primi", name: "Gnocchi di Patate al Sugo", desc: "Piatto medio (~220g)", kcal: 380, p: 9, c: 70, f: 7 },
    { cat: "Primi", name: "Risotto (Zafferano / Funghi / Verdure)", desc: "Piatto medio mantecato", kcal: 450, p: 11, c: 68, f: 14 },
    { cat: "Primi", name: "Riso Basmati o Bianco Bollito", desc: "Porzione media (~85g crudo)", kcal: 310, p: 7, c: 67, f: 1 },
    { cat: "Primi", name: "Tortellini / Ravioli Ripieni di Carne", desc: "In brodo o con burro e salvia", kcal: 480, p: 20, c: 55, f: 19 },
    { cat: "Primi", name: "Minestrone di Verdure (Senza pasta)", desc: "Fondina piena", kcal: 140, p: 5, c: 20, f: 4 },

    { cat: "Secondi", name: "Petto di Pollo / Tacchino alla Piastra", desc: "Porzione media (~160g)", kcal: 210, p: 38, c: 0, f: 6 },
    { cat: "Secondi", name: "Pollo Arrosto / Al Forno (Con pelle)", desc: "Coscia/sovracoscia o quarto medio", kcal: 330, p: 34, c: 0, f: 21 },
    { cat: "Secondi", name: "Cotoletta Impanata (Pollo o Vitello)", desc: "Porzione media casalinga", kcal: 390, p: 28, c: 20, f: 22 },
    { cat: "Secondi", name: "Bistecca / Tagliata di Manzo", desc: "Taglio medio (~180g)", kcal: 310, p: 38, c: 0, f: 17 },
    { cat: "Secondi", name: "Polpette di Carne al Sugo", desc: "4-5 polpette medie", kcal: 370, p: 24, c: 12, f: 25 },
    { cat: "Secondi", name: "Lonza o Braciola di Maiale in Padella", desc: "Fetta media (~160g)", kcal: 290, p: 33, c: 0, f: 17 },
    { cat: "Secondi", name: "Pesce Bianco al Forno (Orata/Branzino/Merluzzo)", desc: "Filetto medio (~180g)", kcal: 210, p: 34, c: 0, f: 8 },
    { cat: "Secondi", name: "Trancio di Salmone (Piastra o Forno)", desc: "Trancio medio (~150g)", kcal: 320, p: 31, c: 0, f: 21 },
    { cat: "Secondi", name: "Frittata (2 Uova + Verdure/Formaggio)", desc: "Porzione media", kcal: 260, p: 17, c: 3, f: 20 },
    { cat: "Secondi", name: "Uova (2 Uova sode, occhio di bue o strapazzate)", desc: "2 uova medie", kcal: 170, p: 14, c: 1, f: 12 },
    { cat: "Secondi", name: "Mozzarella / Burrata / Fior di Latte", desc: "1 Mozzarella media (125g)", kcal: 315, p: 22, c: 2, f: 24 },
    { cat: "Secondi", name: "Bresaola o Prosciutto Crudo Sgrassato", desc: "Porzione media (~80g)", kcal: 145, p: 25, c: 0, f: 4 },
    { cat: "Secondi", name: "Tonno in Scatola Sgocciolato", desc: "Porzione doppia (~100g sgocciolato)", kcal: 190, p: 26, c: 0, f: 9 },

    { cat: "Contorni", name: "Patate al Forno", desc: "Porzione media condita (~180g)", kcal: 240, p: 4, c: 36, f: 9 },
    { cat: "Contorni", name: "Purè di Patate Casalingo", desc: "Porzione media con latte e burro", kcal: 210, p: 5, c: 28, f: 9 },
    { cat: "Contorni", name: "Verdure Grigliate o Bollite", desc: "Zucchine, melanzane, broccoli o spinaci", kcal: 95, p: 3, c: 8, f: 6 },
    { cat: "Contorni", name: "Insalata Mista Condita", desc: "Ciotola media con un filo d'olio", kcal: 85, p: 2, c: 5, f: 7 },
    { cat: "Contorni", name: "Legumi in Umido (Fagioli/Lenticchie/Ceci)", desc: "Porzione contorno (~150g cotti)", kcal: 190, p: 11, c: 26, f: 4 },
    { cat: "Contorni", name: "Pane Comune (1 Rosetta o 2 Fette)", desc: "Circa 60g di pane", kcal: 165, p: 5, c: 34, f: 1 },

    { cat: "Pizze e Unici", name: "Piadina Farcita Casalinga", desc: "Prosciutto e formaggio", kcal: 510, p: 23, c: 48, f: 25 },
    { cat: "Pizze e Unici", name: "Panino Imbottito / Toast Grande", desc: "Con affettato e formaggio", kcal: 410, p: 20, c: 42, f: 18 },
    { cat: "Pizze e Unici", name: "Insalatona Mista Ricca", desc: "Con tonno, uova o mozzarella", kcal: 390, p: 26, c: 12, f: 26 },
    { cat: "Pizze e Unici", name: "Parmigiana di Melanzane", desc: "Porzione media", kcal: 380, p: 16, c: 18, f: 27 },

    { cat: "Colazione", name: "Cornetto / Brioche da Bar", desc: "1 Cornetto classico", kcal: 280, p: 5, c: 36, f: 13 },
    { cat: "Colazione", name: "Latte / Cappuccino + 4-5 Biscotti", desc: "Colazione classica italiana", kcal: 320, p: 10, c: 46, f: 10 },
    { cat: "Colazione", name: "Yogurt Greco + Avena e Frutta Secca", desc: "Ciotola fitness completa", kcal: 340, p: 24, c: 38, f: 10 },
    { cat: "Colazione", name: "Frutta Fresca (1 Mela, Banana o Pera)", desc: "1 Frutto medio", kcal: 95, p: 1, c: 22, f: 0 },
    { cat: "Colazione", name: "Frutta Secca (Noci, Mandorle, Nocciole)", desc: "1 Manciata (~30g)", kcal: 185, p: 6, c: 4, f: 16 }
];

// ==================== 2. DATABASE PALESTRA & INTEGRATORI ====================
const gymFoodDB = [
    // PROTEINE IN POLVERE
    { cat: "Proteine in Polvere", name: "Whey Protein Concentrate (1 Misurino 30g)", desc: "In acqua - ~80% concentrazione proteica", kcal: 118, p: 24, c: 2, f: 2 },
    { cat: "Proteine in Polvere", name: "Iso Whey Zero / Isolate (1 Misurino 30g)", desc: "Isolate pure senza lattosio/grassi", kcal: 108, p: 26, c: 1, f: 0 },
    { cat: "Proteine in Polvere", name: "Caseine Micellari Lento Rilascio (30g)", desc: "Ideali pre-nanna", kcal: 112, p: 24, c: 2, f: 1 },
    { cat: "Proteine in Polvere", name: "Proteine Vegetali / Soy / Pea (30g)", desc: "1 Misurino standard in acqua", kcal: 115, p: 23, c: 2, f: 2 },
    { cat: "Proteine in Polvere", name: "Mass Gainer Ipercalorico (Dose 100g)", desc: "Miscela carboidrati + proteine", kcal: 385, p: 30, c: 60, f: 3 },

    // CREATINA, AMINOACIDI E PRE-WORKOUT
    { cat: "Creatina & Pre-Workout", name: "Creatina Monoidrato Pura (Misurino 3g - 5g)", desc: "Zero calorie - Idratazione cellulare e forza", kcal: 0, p: 0, c: 0, f: 0 },
    { cat: "Creatina & Pre-Workout", name: "Aminoacidi Essenziali EAA / BCAA (10g)", desc: "Intra/Post-workout (~8g aminoacidi)", kcal: 32, p: 8, c: 0, f: 0 },
    { cat: "Creatina & Pre-Workout", name: "Pre-Workout Booster in Polvere (1 Scoop)", desc: "Con caffeina, citrullina e beta-alanina", kcal: 15, p: 0, c: 3, f: 0 },
    { cat: "Creatina & Pre-Workout", name: "Ciclodestrine / Maltodestrine Intra-Workout (30g)", desc: "Carboidrati liquidi a rapido assorbimento", kcal: 116, p: 0, c: 29, f: 0 },
    { cat: "Creatina & Pre-Workout", name: "Energy Drink Zero Zuccheri (es. Monster Bianca)", desc: "Lattina da 500ml zero calorie", kcal: 12, p: 0, c: 3, f: 0 },

    // BARRETTE & SNACK PROTEICI
    { cat: "Barrette & Snack", name: "Barretta Proteica Standard (50g)", desc: "36-40% proteine, basso zucchero", kcal: 185, p: 18, c: 15, f: 6 },
    { cat: "Barrette & Snack", name: "Barretta Proteica Maxi / Enervit / Grenade (60g)", desc: "Ricoperta di cioccolato (20g+ proteine)", kcal: 225, p: 21, c: 18, f: 8 },
    { cat: "Barrette & Snack", name: "Budino / Pudding Proteico (Vasetto 200g)", desc: "Tipo HiPro / Milbona / Ehrmann (20g prot)", kcal: 155, p: 20, c: 11, f: 3 },
    { cat: "Barrette & Snack", name: "Mousse / Drink Proteico in Bottiglia (300ml)", desc: "Bevanda pronta (25-30g proteine)", kcal: 180, p: 26, c: 14, f: 2 },

    // CIBI BASE PALESTRA
    { cat: "Cibi Palestra", name: "Yogurt Greco 0% Grassi (Vasetto 150-170g)", desc: "Tipo Fage Total 0% / Pavlakis", kcal: 92, p: 17, c: 6, f: 0 },
    { cat: "Cibi Palestra", name: "Albume d'Uovo Pastorizzato (200ml)", desc: "Cotto in padella o per pancake", kcal: 96, p: 21, c: 1, f: 0 },
    { cat: "Cibi Palestra", name: "Fiocchi di Latte Light / Cottage Cheese (200g)", desc: "1 Confezione intera ad alto contenuto proteico", kcal: 165, p: 26, c: 5, f: 4 },
    { cat: "Cibi Palestra", name: "Burro d'Arachidi 100% Naturale (1 Cucchiaio ~20g)", desc: "Grassi buoni e proteine vegetali", kcal: 120, p: 5, c: 3, f: 10 },
    { cat: "Cibi Palestra", name: "Fiocchi d'Avena / Farina d'Avena (50g)", desc: "Ottima fonte di carboidrati a lento rilascio", kcal: 185, p: 7, c: 30, f: 3 },
    { cat: "Cibi Palestra", name: "Gallette di Riso o Mais (4 Gallette ~32g)", desc: "Carboidrati rapidi digeribili", kcal: 122, p: 3, c: 26, f: 1 },
    { cat: "Cibi Palestra", name: "Pancake Proteico Pronto (Porzione 2 Pancake)", desc: "Avena + Albume / Whey", kcal: 240, p: 22, c: 28, f: 4 }
];

// ==================== 3. DATABASE SGARRO, FAST FOOD & ALCOLICI ====================
const cheatFoodDB = [
    // MCDONALD'S
    { cat: "McDonald's", name: "Big Mac", desc: "Panino singolo ufficiale McDonald's", kcal: 503, p: 27, c: 42, f: 25, isDrink: false },
    { cat: "McDonald's", name: "Gran Crispy McBacon", desc: "Versione grande con doppio burger e bacon", kcal: 763, p: 46, c: 43, f: 45, isDrink: false },
    { cat: "McDonald's", name: "Crispy McBacon (Classico)", desc: "Panino singolo ufficiale McDonald's", kcal: 503, p: 29, c: 34, f: 28, isDrink: false },
    { cat: "McDonald's", name: "McChicken", desc: "Panino singolo ufficiale con pollo", kcal: 435, p: 19, c: 45, f: 19, isDrink: false },
    { cat: "McDonald's", name: "Double Cheeseburger", desc: "Panino doppio con cheddar", kcal: 445, p: 26, c: 32, f: 23, isDrink: false },
    { cat: "McDonald's", name: "My Selection BBQ / Chicken / Bacon", desc: "Linea premium McDonald's", kcal: 685, p: 38, c: 54, f: 35, isDrink: false },
    { cat: "McDonald's", name: "Chicken McNuggets (6 pezzi)", desc: "Porzione da 6 nuggets senza salse", kcal: 268, p: 16, c: 18, f: 14, isDrink: false },
    { cat: "McDonald's", name: "Chicken McNuggets (9 pezzi)", desc: "Porzione da 9 nuggets senza salse", kcal: 402, p: 24, c: 27, f: 21, isDrink: false },
    { cat: "McDonald's", name: "Patatine Medie McDonald's", desc: "Porzione media ufficiale (114g)", kcal: 330, p: 4, c: 42, f: 16, isDrink: false },
    { cat: "McDonald's", name: "McFlurry (Oreo / Bacio / Smarties)", desc: "1 Coppa McFlurry standard", kcal: 345, p: 7, c: 52, f: 12, isDrink: false },

    // KEBAB & STREET FOOD
    { cat: "Kebab & Street", name: "Panino / Piadina Kebab Completo", desc: "Carne, verdure, patatine e salse", kcal: 840, p: 42, c: 78, f: 40, isDrink: false },
    { cat: "Kebab & Street", name: "Kebab Completo (Senza patatine dentro)", desc: "Carne, insalata, pomodoro, cipolla e salse", kcal: 680, p: 39, c: 60, f: 31, isDrink: false },
    { cat: "Kebab & Street", name: "Piatto Kebab Completo", desc: "Carne abbondante, patatine fritte, insalata e salse", kcal: 960, p: 52, c: 68, f: 54, isDrink: false },
    { cat: "Kebab & Street", name: "Smash Burger Doppio con Bacon e Cheddar", desc: "Burger artigianale da pub/hamburgeria", kcal: 820, p: 46, c: 48, f: 50, isDrink: false },
    { cat: "Kebab & Street", name: "Hot Dog Completo con Salse", desc: "Panino con wurstel, ketchup e maionese", kcal: 420, p: 14, c: 36, f: 24, isDrink: false },
    { cat: "Kebab & Street", name: "Arancino / Supplì / Crocchè Grande", desc: "1 Pezzo grande da rosticceria", kcal: 390, p: 11, c: 48, f: 17, isDrink: false },

    // SUSHI & ETNICO
    { cat: "Sushi & Etnico", name: "Sushi All You Can Eat (Pranzo Moderato)", desc: "Stima ~18-20 pezzi misti + 1 antipasto caldo", kcal: 1150, p: 58, c: 155, f: 32, isDrink: false },
    { cat: "Sushi & Etnico", name: "Sushi All You Can Eat (Cena Abbondante)", desc: "Stima ~28-32 pezzi tra roll fritti, salse e antipasti", kcal: 1680, p: 82, c: 225, f: 48, isDrink: false },
    { cat: "Sushi & Etnico", name: "Uramaki Roll (8 pezzi - Salmone/Avocado/Phila)", desc: "1 Porzione da 8 pezzi classici", kcal: 390, p: 16, c: 54, f: 12, isDrink: false },
    { cat: "Sushi & Etnico", name: "Poke Bowl Regular (Salmone/Tonno, Riso, Salse)", desc: "Ciotola media completa", kcal: 640, p: 34, c: 76, f: 22, isDrink: false },

    // PIZZE & FRITTI
    { cat: "Pizze & Fritti", name: "Pizza Margherita Intera da Pizzeria", desc: "1 Pizza tonda classica", kcal: 820, p: 32, c: 115, f: 24, isDrink: false },
    { cat: "Pizze & Fritti", name: "Pizza Diavola / Salsiccia / Capricciosa", desc: "1 Pizza tonda farcita", kcal: 990, p: 40, c: 115, f: 40, isDrink: false },
    { cat: "Pizze & Fritti", name: "Pizza 4 Formaggi / Patatine e Wurstel", desc: "1 Pizza tonda molto calorica", kcal: 1120, p: 44, c: 120, f: 52, isDrink: false },
    { cat: "Pizze & Fritti", name: "Porzione Patatine Fritte da Pub/Pizzeria", desc: "Piatto medio-grande", kcal: 420, p: 5, c: 50, f: 22, isDrink: false },

    // BIRRE & VINI (Dati alcolimetrici: 7 kcal per grammo di etanolo + zuccheri residui)
    { cat: "Birre & Vini", name: "Birra Chiara Piccola / Bottiglia (330ml - 5%)", desc: "Lager/Pilsner classica (es. Heineken, Moretti)", kcal: 142, p: 1, c: 11, f: 0, isDrink: true },
    { cat: "Birre & Vini", name: "Birra Chiara Media alla Spina (500ml - 5%)", desc: "Pinta intera bionda classica", kcal: 215, p: 2, c: 17, f: 0, isDrink: true },
    { cat: "Birre & Vini", name: "Birra Doppio Malto / IPA Artigianale (330ml - 7.5%)", desc: "Più densa e alcolica di una bionda", kcal: 210, p: 2, c: 18, f: 0, isDrink: true },
    { cat: "Birre & Vini", name: "Calice di Vino Rosso (150ml - 13%)", desc: "Chianti, Primitivo, Nero d'Avola, ecc.", kcal: 128, p: 0, c: 4, f: 0, isDrink: true },
    { cat: "Birre & Vini", name: "Calice di Vino Bianco Fermo (150ml - 12%)", desc: "Pinot, Lugana, Vermentino, ecc.", kcal: 120, p: 0, c: 4, f: 0, isDrink: true },
    { cat: "Birre & Vini", name: "Calice di Prosecco / Spumante Brut (150ml)", desc: "1 Calice da aperitivo o brindisi", kcal: 110, p: 0, c: 3, f: 0, isDrink: true },

    // COCKTAIL & SUPERALCOLICI (Ricette standard IBA)
    { cat: "Cocktail & Superalcolici", name: "Aperol Spritz / Campari Spritz", desc: "Prosecco, Aperol/Campari e Soda (~200ml)", kcal: 165, p: 0, c: 18, f: 0, isDrink: true },
    { cat: "Cocktail & Superalcolici", name: "Gin Tonic / Vodka Tonic (Classico)", desc: "45ml Gin/Vodka + 150ml Acqua Tonica", kcal: 170, p: 0, c: 14, f: 0, isDrink: true },
    { cat: "Cocktail & Superalcolici", name: "Gin Lemon / Vodka Lemon", desc: "45ml Distillato + 150ml Lemon Soda", kcal: 180, p: 0, c: 16, f: 0, isDrink: true },
    { cat: "Cocktail & Superalcolici", name: "Mojito / Caipiroska / Moscow Mule", desc: "Con zucchero di canna o ginger beer", kcal: 215, p: 0, c: 24, f: 0, isDrink: true },
    { cat: "Cocktail & Superalcolici", name: "Negroni / Americano / Boulevardier", desc: "Gin/Whisky, Vermouth rosso e Campari", kcal: 195, p: 0, c: 15, f: 0, isDrink: true },
    { cat: "Cocktail & Superalcolici", name: "Cuba Libre (Rum & Coca-Cola)", desc: "50ml Rum + 150ml Cola classica", kcal: 185, p: 0, c: 16, f: 0, isDrink: true },
    { cat: "Cocktail & Superalcolici", name: "Vodka Red Bull", desc: "45ml Vodka + 1 Lattina Red Bull", kcal: 210, p: 0, c: 27, f: 0, isDrink: true },
    { cat: "Cocktail & Superalcolici", name: "Shot Superalcolico Liscio (40ml - 40°)", desc: "Vodka, Gin, Rum, Whisky, Tequila o Grappa", kcal: 95, p: 0, c: 0, f: 0, isDrink: true },
    { cat: "Cocktail & Superalcolici", name: "Bicchierino Amaro / Limoncello / Sambuca (40ml)", desc: "Digestivo zuccherato fine pasto", kcal: 135, p: 0, c: 14, f: 0, isDrink: true },

    // DOLCI & GELATI
    { cat: "Dolci & Gelati", name: "Crepe / Waffle alla Nutella", desc: "1 Crepe ben farcita", kcal: 480, p: 8, c: 62, f: 22, isDrink: false },
    { cat: "Dolci & Gelati", name: "Cono / Coppetta Gelato Artigianale (2-3 Gusti)", desc: "Gelato medio alle creme/cioccolato", kcal: 340, p: 6, c: 42, f: 16, isDrink: false },
    { cat: "Dolci & Gelati", name: "Tiramisù / Cheesecake (1 Porzione)", desc: "Dolce al cucchiaio da ristorante", kcal: 450, p: 8, c: 44, f: 27, isDrink: false }
];

// ==================== VARIABILI GLOBALI ====================
let selectedDbExercise = null;
let calCurrentDate = new Date();
let currentMapBaseDate = null;
let currentMapRange = 1;
let currentDomsFilters = [];

// Variabili Alimentazione
let selectedHomeFood = null;
let currentPortionSize = 'M';
let currentCondimentLevel = 'norm';
let selectedOnlineFood = null;
let onlineSearchResultsCache = [];
let selectedGymFood = null;
let currentGymMultiplier = 1;
let selectedCheatFood = null;
let currentCheatCombo = 'single';

function getHistKey(exName) { return 'hist_' + exName.toLowerCase().replace(/[^a-z0-9]/g, ''); }

const defaultRoutineData = { name: "La Mia Scheda", days: { giorno1: { title: "Giorno 1", desc: "Inizia ad aggiungere esercizi", exercises: [] } } };

let allRoutines = JSON.parse(localStorage.getItem('all_saved_routines')) || { "default-routine-id": defaultRoutineData };
let activeRoutineId = localStorage.getItem('active_routine_id') || "default-routine-id";
if(!allRoutines[activeRoutineId]) activeRoutineId = Object.keys(allRoutines)[0];

function saveAllRoutines() {
    localStorage.setItem('all_saved_routines', JSON.stringify(allRoutines));
    localStorage.setItem('active_routine_id', activeRoutineId);
}
let currentRoutine = allRoutines[activeRoutineId];
let chartInstances = {};
let confirmCallback = null;

function migrateHistory() {
    for (const [rId, rData] of Object.entries(allRoutines)) {
        for (const [dk, d] of Object.entries(rData.days)) {
            d.exercises.forEach(ex => {
                const oldKey = `hist-${ex.id}`;
                const oldDataStr = localStorage.getItem(oldKey);
                if (oldDataStr) {
                    const hk = getHistKey(ex.name);
                    let oldData = JSON.parse(oldDataStr);
                    let newData = JSON.parse(localStorage.getItem(hk)) || [];
                    oldData.forEach(o => { if(!newData.some(n => n.date===o.date && n.sets===o.sets && n.reps===o.reps && n.weight===o.weight)) newData.push(o); });
                    newData.sort((a,b) => new Date(b.date) - new Date(a.date));
                    localStorage.setItem(hk, JSON.stringify(newData));
                    localStorage.removeItem(oldKey);
                }
            });
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    migrateHistory();
    caricaProfilo();
    renderMeasurements();
    const today = new Date();
    document.getElementById('measure-date').valueAsDate = today;
    document.getElementById('prog-date').valueAsDate = today;
    document.getElementById('diet-date').valueAsDate = today;
    document.getElementById('diary-inspect-date').valueAsDate = today;
    initCalendarDropdowns();
    buildDaysNavigation();
    renderWorkouts();
    renderProgressioni();
    renderMonthlyCalendar();
    renderNutritionDashboard();
    switchMainTab('workout');
});

// ==================== NAVIGAZIONE PRINCIPALE (4 TAB) ====================
function switchMainTab(tab) {
    ['profilo', 'workout', 'alimentazione', 'progressioni'].forEach(t => {
        const btn = document.getElementById(`nav-btn-${t}`);
        if(t === tab) {
            btn.classList.replace('bottom-nav-inactive', 'bottom-nav-active');
        } else {
            btn.classList.replace('bottom-nav-active', 'bottom-nav-inactive');
        }
        document.getElementById(`main-tab-${t}-content`).style.display = 'none';
    });
    document.getElementById(`main-tab-${tab}-content`).style.display = 'block';

    const headerTitle = document.getElementById('main-header-title');
    const headerBtn = document.getElementById('header-action-btn');
    const dynNav = document.getElementById('dynamic-nav-container');

    if(tab === 'profilo') {
        headerTitle.innerText = "Area Personale";
        headerBtn.classList.add('hidden'); headerBtn.classList.remove('flex');
        dynNav.classList.add('hidden');
        renderMonthlyCalendar();
    } else if (tab === 'workout') {
        headerTitle.innerText = currentRoutine.name;
        headerBtn.classList.remove('hidden'); headerBtn.classList.add('flex');
        dynNav.classList.remove('hidden');
        reopenCurrentTab();
    } else if (tab === 'alimentazione') {
        headerTitle.innerText = "Alimentazione";
        headerBtn.classList.add('hidden'); headerBtn.classList.remove('flex');
        dynNav.classList.add('hidden');
        renderNutritionDashboard();
    } else if (tab === 'progressioni') {
        headerTitle.innerText = "Storico e Analisi";
        headerBtn.classList.add('hidden'); headerBtn.classList.remove('flex');
        dynNav.classList.add('hidden');
    }
}

// ==================== PROFILO E CALCOLO METABOLICO ====================
function salvaProfiloEMisure() {
    const profilo = {
        nome: document.getElementById('prof-nome').value,
        cognome: document.getElementById('prof-cognome').value,
        sesso: document.getElementById('prof-sesso').value || 'M',
        eta: document.getElementById('prof-eta').value,
        peso: document.getElementById('prof-peso').value,
        altezza: document.getElementById('prof-altezza').value,
        attivita: document.getElementById('prof-attivita').value || '1.375',
        obiettivo: document.getElementById('prof-obiettivo').value || 'maint'
    };
    localStorage.setItem('user_profile', JSON.stringify(profilo));

    const date = document.getElementById('measure-date').value;
    const m = {
        date: date,
        spalle: document.getElementById('meas-spalle').value,
        petto: document.getElementById('meas-petto').value,
        braccia: document.getElementById('meas-braccia').value,
        vita: document.getElementById('meas-vita').value,
        fianchi: document.getElementById('meas-fianchi').value,
        cosce: document.getElementById('meas-cosce').value,
        polpacci: document.getElementById('meas-polpacci').value
    };

    if (date && (m.spalle || m.petto || m.braccia || m.vita || m.fianchi || m.cosce || m.polpacci)) {
        let hist = JSON.parse(localStorage.getItem('measurements_history')) || [];
        let existingIdx = hist.findIndex(x => x.date === date);
        if(existingIdx >= 0) hist[existingIdx] = m; else hist.unshift(m);
        hist.sort((a,b) => new Date(b.date) - new Date(a.date));
        localStorage.setItem('measurements_history', JSON.stringify(hist));
        ['spalle', 'petto', 'braccia', 'vita', 'fianchi', 'cosce', 'polpacci'].forEach(id => document.getElementById(`meas-${id}`).value = '');
        renderMeasurements();
    }

    renderNutritionDashboard();
    const msg = document.getElementById('prof-msg');
    msg.classList.remove('hidden');
    setTimeout(() => msg.classList.add('hidden'), 3000);
}

function caricaProfilo() {
    const p = JSON.parse(localStorage.getItem('user_profile'));
    if(p) {
        document.getElementById('prof-nome').value = p.nome || '';
        document.getElementById('prof-cognome').value = p.cognome || '';
        document.getElementById('prof-sesso').value = p.sesso || 'M';
        document.getElementById('prof-eta').value = p.eta || '';
        document.getElementById('prof-peso').value = p.peso || '';
        document.getElementById('prof-altezza').value = p.altezza || '';
        document.getElementById('prof-attivita').value = p.attivita || '1.375';
        document.getElementById('prof-obiettivo').value = p.obiettivo || 'maint';
    }
}

function calculateMacroTargets() {
    const p = JSON.parse(localStorage.getItem('user_profile')) || {};
    const peso = parseFloat(p.peso);
    const altezza = parseFloat(p.altezza);
    const eta = parseFloat(p.eta);
    const sesso = p.sesso || 'M';
    const act = parseFloat(p.attivita) || 1.375;
    const goal = p.obiettivo || 'maint';

    if (!peso || !altezza || !eta) {
        return { valid: false, kcal: 2000, p: 130, c: 220, f: 65 };
    }

    let bmr = (10 * peso) + (6.25 * altezza) - (5 * eta) + (sesso === 'M' ? 5 : -161);
    let tdee = bmr * act;

    let targetKcal = tdee;
    let protPerKg = 1.8;
    let fatPerKg = 0.9;

    if (goal === 'cut') {
        targetKcal = tdee * 0.80;
        protPerKg = 2.0;
        fatPerKg = 0.8;
    } else if (goal === 'bulk') {
        targetKcal = tdee * 1.15;
        protPerKg = 1.8;
        fatPerKg = 1.0;
    }

    targetKcal = Math.round(targetKcal);
    let targetP = Math.round(peso * protPerKg);
    let targetF = Math.round(peso * fatPerKg);
    let remainingKcal = targetKcal - (targetP * 4) - (targetF * 9);
    let targetC = Math.max(50, Math.round(remainingKcal / 4));

    return { valid: true, kcal: targetKcal, p: targetP, c: targetC, f: targetF };
}

// ==================== SEZIONE ALIMENTAZIONE, ACQUA & DIARIO ====================
function getDietDateKey(customDateStr = null) {
    const d = customDateStr || document.getElementById('diet-date').value || new Date().toISOString().split('T')[0];
    return 'diet_log_' + d;
}

function getWaterDateKey(customDateStr = null) {
    const d = customDateStr || document.getElementById('diet-date').value || new Date().toISOString().split('T')[0];
    return 'water_log_' + d;
}

function updateWaterCount(delta) {
    const wKey = getWaterDateKey();
    let cur = parseInt(localStorage.getItem(wKey)) || 0;
    cur = Math.max(0, cur + delta);
    localStorage.setItem(wKey, cur);
    renderNutritionDashboard();
}

function renderNutritionDashboard() {
    const targets = calculateMacroTargets();
    const warningEl = document.getElementById('diet-profile-warning');
    if (!targets.valid) warningEl.classList.remove('hidden');
    else warningEl.classList.add('hidden');

    // Aggiorna contatore Acqua (1 bicchiere = 0.25L, target base = 8 bicchieri = 2.0L)
    const glasses = parseInt(localStorage.getItem(getWaterDateKey())) || 0;
    const liters = (glasses * 0.25).toFixed(2).replace(/\.00$/, '.0').replace(/(\.\d)0$/, '$1');
    document.getElementById('water-glasses-count').innerText = glasses;
    document.getElementById('water-liters-count').innerText = liters;
    document.getElementById('water-progress-bar').style.width = `${Math.min(100, (glasses / 8) * 100)}%`;

    const logs = JSON.parse(localStorage.getItem(getDietDateKey())) || [];
    let totKcal = 0, totP = 0, totC = 0, totF = 0;

    logs.forEach(item => {
        totKcal += item.kcal;
        totP += item.p;
        totC += item.c;
        totF += item.f;
    });

    document.getElementById('kcal-current').innerText = Math.round(totKcal);
    document.getElementById('kcal-target').innerText = targets.kcal;
    document.getElementById('macro-p-cur').innerText = Math.round(totP);
    document.getElementById('macro-p-tar').innerText = targets.p;
    document.getElementById('macro-c-cur').innerText = Math.round(totC);
    document.getElementById('macro-c-tar').innerText = targets.c;
    document.getElementById('macro-f-cur').innerText = Math.round(totF);
    document.getElementById('macro-f-tar').innerText = targets.f;

    const kcalPct = Math.min(100, Math.round((totKcal / targets.kcal) * 100));
    const kcalBar = document.getElementById('kcal-progress-bar');
    const badge = document.getElementById('kcal-status-badge');
    kcalBar.style.width = `${kcalPct}%`;

    const ratio = totKcal / targets.kcal;
    if (ratio < 0.85) {
        kcalBar.className = "h-full bg-blue-500 transition-all duration-300 rounded-full";
        badge.className = "text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-700 text-slate-300";
        badge.innerText = `Mancano ${Math.max(0, targets.kcal - Math.round(totKcal))} kcal`;
    } else if (ratio <= 1.08) {
        kcalBar.className = "h-full bg-green-500 transition-all duration-300 rounded-full";
        badge.className = "text-[11px] font-bold px-2.5 py-1 rounded-full bg-green-900/60 text-green-300 border border-green-500/40";
        badge.innerText = "Target Raggiunto!";
    } else {
        kcalBar.className = "h-full bg-red-500 transition-all duration-300 rounded-full";
        badge.className = "text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-900/60 text-red-300 border border-red-500/40";
        badge.innerText = `Sforato di ${Math.round(totKcal) - targets.kcal} kcal`;
    }

    document.getElementById('macro-p-bar').style.width = `${Math.min(100, (totP / targets.p) * 100)}%`;
    document.getElementById('macro-c-bar').style.width = `${Math.min(100, (totC / targets.c) * 100)}%`;
    document.getElementById('macro-f-bar').style.width = `${Math.min(100, (totF / targets.f) * 100)}%`;

    const listContainer = document.getElementById('daily-meals-list');
    listContainer.innerHTML = '';

    if (logs.length === 0) {
        listContainer.innerHTML = `<div class="text-center text-xs text-slate-500 py-8 bg-slate-800 rounded-xl border border-slate-700 border-dashed">Nessun pasto registrato in questa data. Premi <b>Aggiungi Pasto, Integratore o Sgarro</b>!</div>`;
        return;
    }

    const mealOrder = ["Colazione", "Pranzo", "Cena", "Spuntino"];
    mealOrder.forEach(mealType => {
        const mealItems = logs.map((item, idx) => ({ ...item, originalIdx: idx })).filter(x => x.mealType === mealType);
        if (mealItems.length === 0) return;

        let subKcal = mealItems.reduce((acc, x) => acc + x.kcal, 0);
        let html = `<div class="bg-slate-800 rounded-xl p-3.5 border border-slate-700 shadow">
            <div class="flex justify-between items-center border-b border-slate-700 pb-2 mb-2">
                <h4 class="font-bold text-blue-400 text-sm">${mealType}</h4>
                <span class="text-xs font-semibold text-slate-300">${Math.round(subKcal)} kcal</span>
            </div>
            <div class="space-y-2">`;

        mealItems.forEach(item => {
            let itemBadge = '';
            if (item.isCheat) itemBadge = `<span class="bg-orange-600/30 border border-orange-500/50 text-orange-300 text-[9px] font-bold px-1.5 py-0.5 rounded ml-1.5">SGARRO</span>`;
            else if (item.isGym) itemBadge = `<span class="bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 text-[9px] font-bold px-1.5 py-0.5 rounded ml-1.5">GYM</span>`;

            html += `<div class="flex justify-between items-center bg-slate-900/80 p-2.5 rounded-lg border ${item.isCheat ? 'border-orange-500/30' : (item.isGym ? 'border-emerald-500/30' : 'border-slate-700/50')}">
                <div class="flex-1 pr-2">
                    <div class="text-xs font-bold text-slate-100 flex items-center flex-wrap">${item.name}${itemBadge}</div>
                    <div class="text-[10px] text-slate-400 mt-0.5">${item.details} • <span class="text-blue-300">P: ${item.p}g</span> | <span class="text-amber-300">C: ${item.c}g</span> | <span class="text-rose-300">G: ${item.f}g</span></div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-white whitespace-nowrap">${item.kcal} kcal</span>
                    <button onclick="deleteFoodLog(${item.originalIdx})" class="text-slate-500 hover:text-red-500 p-1"><i class="fas fa-times"></i></button>
                </div>
            </div>`;
        });

        html += `</div></div>`;
        listContainer.innerHTML += html;
    });
}

// ==================== MODALE DIARIO STORICO ====================
function getLoggedDietDates() {
    let dateSet = new Set();
    for (let i = 0; i < localStorage.length; i++) {
        let k = localStorage.key(i);
        if (k && k.startsWith('diet_log_')) {
            let arr = JSON.parse(localStorage.getItem(k)) || [];
            if (arr.length > 0) dateSet.add(k.replace('diet_log_', ''));
        } else if (k && k.startsWith('water_log_')) {
            let w = parseInt(localStorage.getItem(k)) || 0;
            if (w > 0) dateSet.add(k.replace('water_log_', ''));
        }
    }
    return Array.from(dateSet).sort((a, b) => new Date(b) - new Date(a));
}

function openFoodDiaryModal() {
    const currentSelected = document.getElementById('diet-date').value || new Date().toISOString().split('T')[0];
    document.getElementById('diary-inspect-date').value = currentSelected;
    renderDiaryLoggedDatesPills();
    renderDiaryModalContent();
    document.getElementById('food-diary-modal').classList.remove('hidden');
    document.getElementById('food-diary-modal').classList.add('flex');
}

function closeFoodDiaryModal() {
    document.getElementById('food-diary-modal').classList.add('hidden');
    document.getElementById('food-diary-modal').classList.remove('flex');
}

function renderDiaryLoggedDatesPills() {
    const pillsContainer = document.getElementById('diary-logged-dates-pills');
    const dates = getLoggedDietDates();
    pillsContainer.innerHTML = '';

    if (dates.length === 0) {
        pillsContainer.innerHTML = `<span class="text-[11px] text-slate-500 italic">Nessuna giornata salvata finora.</span>`;
        return;
    }

    dates.slice(0, 12).forEach(dStr => {
        const btn = document.createElement('button');
        btn.className = "px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900 border border-slate-700 text-blue-400 hover:bg-blue-600 hover:text-white shrink-0 transition-colors";
        btn.innerText = formatDate(dStr);
        btn.onclick = () => {
            document.getElementById('diary-inspect-date').value = dStr;
            renderDiaryModalContent();
        };
        pillsContainer.appendChild(btn);
    });
}

function renderDiaryModalContent() {
    const dStr = document.getElementById('diary-inspect-date').value;
    const targets = calculateMacroTargets();
    const logs = JSON.parse(localStorage.getItem(getDietDateKey(dStr))) || [];
    const glasses = parseInt(localStorage.getItem(getWaterDateKey(dStr))) || 0;
    const liters = (glasses * 0.25).toFixed(2).replace(/\.00$/, '.0').replace(/(\.\d)0$/, '$1');

    let totKcal = 0, totP = 0, totC = 0, totF = 0;
    logs.forEach(x => { totKcal += x.kcal; totP += x.p; totC += x.c; totF += x.f; });

    const summaryEl = document.getElementById('diary-modal-summary');
    summaryEl.innerHTML = `
        <div class="flex justify-between items-center border-b border-slate-800 pb-2 mb-2.5">
            <span class="text-xs font-bold text-slate-300">Riepilogo del ${formatDate(dStr)}</span>
            <span class="text-sm font-extrabold text-white">${Math.round(totKcal)} <span class="text-xs font-normal text-slate-400">/ ${targets.kcal} kcal</span></span>
        </div>
        <div class="grid grid-cols-4 gap-1.5 text-center text-xs">
            <div class="bg-slate-800/80 p-2 rounded-lg">
                <div class="text-[10px] text-blue-400 font-bold">Proteine</div>
                <div class="font-bold text-white mt-0.5">${Math.round(totP)}g</div>
            </div>
            <div class="bg-slate-800/80 p-2 rounded-lg">
                <div class="text-[10px] text-amber-400 font-bold">Carbo</div>
                <div class="font-bold text-white mt-0.5">${Math.round(totC)}g</div>
            </div>
            <div class="bg-slate-800/80 p-2 rounded-lg">
                <div class="text-[10px] text-rose-400 font-bold">Grassi</div>
                <div class="font-bold text-white mt-0.5">${Math.round(totF)}g</div>
            </div>
            <div class="bg-slate-800/80 p-2 rounded-lg border border-cyan-500/30">
                <div class="text-[10px] text-cyan-400 font-bold"><i class="fas fa-tint mr-0.5"></i>Acqua</div>
                <div class="font-bold text-cyan-300 mt-0.5">${glasses} bic. (${liters}L)</div>
            </div>
        </div>
    `;

    const mealsEl = document.getElementById('diary-modal-meals');
    mealsEl.innerHTML = '';

    if (logs.length === 0) {
        mealsEl.innerHTML = `<div class="text-center text-xs text-slate-500 py-6 bg-slate-900/50 rounded-xl border border-slate-800">Nessun pasto registrato in questa data.</div>`;
        return;
    }

    const mealOrder = ["Colazione", "Pranzo", "Cena", "Spuntino"];
    mealOrder.forEach(mType => {
        const items = logs.filter(x => x.mealType === mType);
        if (items.length === 0) return;

        let block = `<div class="bg-slate-900 p-3 rounded-lg border border-slate-700/60">
            <div class="text-xs font-bold text-blue-400 mb-1.5">${mType}</div>
            <div class="space-y-1.5">`;
        items.forEach(it => {
            block += `<div class="flex justify-between items-center text-xs border-b border-slate-800 pb-1 last:border-none last:pb-0">
                <div class="pr-2">
                    <span class="font-semibold text-slate-200">${it.name}</span>
                    <div class="text-[10px] text-slate-400">${it.details} (P:${it.p}g C:${it.c}g G:${it.f}g)</div>
                </div>
                <span class="font-bold text-slate-100 shrink-0">${it.kcal} kcal</span>
            </div>`;
        });
        block += `</div></div>`;
        mealsEl.innerHTML += block;
    });
}

function loadDiaryDateIntoMainView() {
    const inspected = document.getElementById('diary-inspect-date').value;
    if (inspected) {
        document.getElementById('diet-date').value = inspected;
        renderNutritionDashboard();
    }
    closeFoodDiaryModal();
}

// ==================== MODALE INSERIMENTO PASTI (4 SEZIONI) ====================
function openFoodModal() {
    selectedHomeFood = null;
    selectedGymFood = null;
    selectedCheatFood = null;
    document.getElementById('home-food-config').classList.add('hidden');
    document.getElementById('online-food-config').classList.add('hidden');
    document.getElementById('gym-food-config').classList.add('hidden');
    document.getElementById('cheat-food-config').classList.add('hidden');
    document.getElementById('home-food-search').value = '';
    document.getElementById('gym-food-search').value = '';
    document.getElementById('cheat-food-search').value = '';
    filterHomeFoodList();
    filterGymFoodList();
    filterCheatFoodList();
    document.getElementById('food-modal').classList.remove('hidden');
    document.getElementById('food-modal').classList.add('flex');
}

function closeFoodModal() {
    document.getElementById('food-modal').classList.add('hidden');
    document.getElementById('food-modal').classList.remove('flex');
}

function switchFoodModalTab(mode) {
    const btnHome = document.getElementById('tab-btn-homefood');
    const btnOnline = document.getElementById('tab-btn-onlinefood');
    const btnGym = document.getElementById('tab-btn-gymfood');
    const btnCheat = document.getElementById('tab-btn-cheatfood');

    const inactiveClass = "py-2 px-2 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-all truncate";
    btnHome.className = inactiveClass;
    btnOnline.className = inactiveClass;
    btnGym.className = inactiveClass;
    btnCheat.className = inactiveClass;

    document.getElementById('food-tab-home').classList.add('hidden');
    document.getElementById('food-tab-online').classList.add('hidden');
    document.getElementById('food-tab-gym').classList.add('hidden');
    document.getElementById('food-tab-cheat').classList.add('hidden');

    if (mode === 'home') {
        btnHome.className = "py-2 px-2 rounded-lg text-xs font-bold bg-blue-600 text-white shadow transition-all truncate";
        document.getElementById('food-tab-home').classList.remove('hidden');
    } else if (mode === 'online') {
        btnOnline.className = "py-2 px-2 rounded-lg text-xs font-bold bg-blue-600 text-white shadow transition-all truncate";
        document.getElementById('food-tab-online').classList.remove('hidden');
    } else if (mode === 'gym') {
        btnGym.className = "py-2 px-2 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow transition-all truncate";
        document.getElementById('food-tab-gym').classList.remove('hidden');
    } else if (mode === 'cheat') {
        btnCheat.className = "py-2 px-2 rounded-lg text-xs font-bold bg-orange-600 text-white shadow transition-all truncate";
        document.getElementById('food-tab-cheat').classList.remove('hidden');
    }
}

// --- LOGICA TAB 1: FAMIGLIA ---
function filterHomeFoodList() {
    const cat = document.getElementById('home-food-cat').value;
    const q = document.getElementById('home-food-search').value.toLowerCase().trim();
    const listEl = document.getElementById('home-food-list');
    listEl.innerHTML = '';

    const filtered = homeFoodDB.filter(item => {
        const matchCat = (cat === 'Tutti' || item.cat === cat);
        const matchQ = (!q || item.name.toLowerCase().includes(q));
        return matchCat && matchQ;
    });

    if (filtered.length === 0) {
        listEl.innerHTML = `<div class="text-xs text-slate-500 text-center py-4">Nessun piatto trovato. Prova nelle altre schede.</div>`;
        return;
    }

    filtered.forEach(item => {
        const div = document.createElement('div');
        div.className = "p-2.5 hover:bg-slate-800 cursor-pointer flex justify-between items-center transition-colors";
        div.innerHTML = `<div>
            <div class="text-xs font-bold text-slate-200">${item.name}</div>
            <div class="text-[10px] text-slate-400">${item.desc}</div>
        </div>
        <span class="text-xs font-semibold text-blue-400 shrink-0 ml-2">${item.kcal} kcal</span>`;
        div.onclick = () => selectHomeFoodItem(item);
        listEl.appendChild(div);
    });
}

function selectHomeFoodItem(item) {
    selectedHomeFood = item;
    document.getElementById('selected-home-food-name').innerText = item.name;
    document.getElementById('selected-home-food-desc').innerText = item.desc;
    document.getElementById('home-food-config').classList.remove('hidden');
    setPortionSize('M');
    setCondimentLevel('norm');
}

function setPortionSize(size) {
    currentPortionSize = size;
    ['S', 'M', 'L', 'XL'].forEach(s => {
        const btn = document.getElementById(`size-btn-${s}`);
        if (s === size) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    updateHomeFoodPreview();
}

function setCondimentLevel(level) {
    currentCondimentLevel = level;
    ['low', 'norm', 'high'].forEach(l => {
        const btn = document.getElementById(`cond-btn-${l}`);
        if (l === level) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    updateHomeFoodPreview();
}

function getCalculatedHomeFoodMacros() {
    if (!selectedHomeFood) return { kcal: 0, p: 0, c: 0, f: 0 };
    const sizeMultipliers = { 'S': 0.7, 'M': 1.0, 'L': 1.35, 'XL': 1.75 };
    const mult = sizeMultipliers[currentPortionSize] || 1.0;

    let p = Math.round(selectedHomeFood.p * mult);
    let c = Math.round(selectedHomeFood.c * mult);
    let f = Math.round(selectedHomeFood.f * mult);

    if (currentCondimentLevel === 'low') {
        f = Math.max(1, f - 4);
    } else if (currentCondimentLevel === 'high') {
        f += 10;
    }

    let kcal = Math.round((p * 4) + (c * 4) + (f * 9));
    return { kcal, p, c, f };
}

function updateHomeFoodPreview() {
    const res = getCalculatedHomeFoodMacros();
    document.getElementById('preview-kcal').innerText = res.kcal;
    document.getElementById('preview-p').innerText = res.p + 'g';
    document.getElementById('preview-c').innerText = res.c + 'g';
    document.getElementById('preview-f').innerText = res.f + 'g';
}

function saveHomeFoodMeal() {
    if (!selectedHomeFood) return;
    const res = getCalculatedHomeFoodMacros();
    const mealType = document.getElementById('food-meal-type').value;
    const condLabels = { 'low': 'Cond. Leggero', 'norm': 'Cond. Normale', 'high': 'Cond. Ricco' };

    const newEntry = {
        mealType: mealType,
        name: selectedHomeFood.name,
        details: `Taglia ${currentPortionSize} (${condLabels[currentCondimentLevel]})`,
        kcal: res.kcal,
        p: res.p,
        c: res.c,
        f: res.f,
        isCheat: false,
        isGym: false
    };

    const key = getDietDateKey();
    let logs = JSON.parse(localStorage.getItem(key)) || [];
    logs.push(newEntry);
    localStorage.setItem(key, JSON.stringify(logs));
    closeFoodModal();
    renderNutritionDashboard();
}

// --- LOGICA TAB 2: CONFEZIONATI ONLINE ---
async function searchOnlineFood() {
    const q = document.getElementById('online-food-query').value.trim();
    const resBox = document.getElementById('online-food-results');
    if (q.length < 2) return;

    resBox.innerHTML = `<div class="text-xs text-blue-400 text-center py-6"><i class="fas fa-spinner fa-spin mr-2"></i>Ricerca nel database mondiale...</div>`;
    try {
        const url = `https://it.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=15`;
        const response = await fetch(url);
        const data = await response.json();

        onlineSearchResultsCache = (data.products || []).filter(p => p.product_name && p.nutriments);
        resBox.innerHTML = '';

        if (onlineSearchResultsCache.length === 0) {
            resBox.innerHTML = `<div class="text-xs text-slate-400 text-center py-4">Nessun prodotto trovato. Prova con un termine più semplice.</div>`;
            return;
        }

        onlineSearchResultsCache.forEach(prod => {
            const name = prod.product_name_it || prod.product_name;
            const brand = prod.brands ? ` (${prod.brands.split(',')[0]})` : '';
            const kcal100 = Math.round(prod.nutriments['energy-kcal_100g'] || (prod.nutriments['energy_100g'] / 4.184) || 0);
            const p100 = Math.round(prod.nutriments.proteins_100g || 0);
            const c100 = Math.round(prod.nutriments.carbohydrates_100g || 0);
            const f100 = Math.round(prod.nutriments.fat_100g || 0);

            const div = document.createElement('div');
            div.className = "p-2.5 hover:bg-slate-800 cursor-pointer flex justify-between items-center";
            div.innerHTML = `<div class="pr-2 truncate">
                <div class="text-xs font-bold text-slate-200 truncate">${name}${brand}</div>
                <div class="text-[10px] text-slate-400">Per 100g: P:${p100}g | C:${c100}g | G:${f100}g</div>
            </div>
            <span class="text-xs font-bold text-blue-400 shrink-0">${kcal100} kcal</span>`;
            div.onclick = () => selectOnlineProduct({ name: name + brand, kcal100, p100, c100, f100 });
            resBox.appendChild(div);
        });
    } catch (err) {
        resBox.innerHTML = `<div class="text-xs text-red-400 text-center py-4">Errore di connessione. Usa le altre schede offline.</div>`;
    }
}

function selectOnlineProduct(prodObj) {
    selectedOnlineFood = prodObj;
    document.getElementById('selected-online-food-name').innerText = prodObj.name;
    document.getElementById('online-food-grams').value = 100;
    document.getElementById('online-food-config').classList.remove('hidden');
    updateOnlineFoodPreview();
}

function updateOnlineFoodPreview() {
    if (!selectedOnlineFood) return;
    const g = parseFloat(document.getElementById('online-food-grams').value) || 0;
    const ratio = g / 100;
    document.getElementById('on-prev-kcal').innerText = Math.round(selectedOnlineFood.kcal100 * ratio);
    document.getElementById('on-prev-p').innerText = Math.round(selectedOnlineFood.p100 * ratio) + 'g';
    document.getElementById('on-prev-c').innerText = Math.round(selectedOnlineFood.c100 * ratio) + 'g';
    document.getElementById('on-prev-f').innerText = Math.round(selectedOnlineFood.f100 * ratio) + 'g';
}

function saveOnlineFoodMeal() {
    if (!selectedOnlineFood) return;
    const g = parseFloat(document.getElementById('online-food-grams').value) || 100;
    const ratio = g / 100;
    const mealType = document.getElementById('food-meal-type').value;

    const newEntry = {
        mealType: mealType,
        name: selectedOnlineFood.name,
        details: `${g}g`,
        kcal: Math.round(selectedOnlineFood.kcal100 * ratio),
        p: Math.round(selectedOnlineFood.p100 * ratio),
        c: Math.round(selectedOnlineFood.c100 * ratio),
        f: Math.round(selectedOnlineFood.f100 * ratio),
        isCheat: false,
        isGym: false
    };

    const key = getDietDateKey();
    let logs = JSON.parse(localStorage.getItem(key)) || [];
    logs.push(newEntry);
    localStorage.setItem(key, JSON.stringify(logs));
    closeFoodModal();
    renderNutritionDashboard();
}

// --- LOGICA TAB 3: PALESTRA & INTEGRATORI ---
function filterGymFoodList() {
    const cat = document.getElementById('gym-food-cat').value;
    const q = document.getElementById('gym-food-search').value.toLowerCase().trim();
    const listEl = document.getElementById('gym-food-list');
    listEl.innerHTML = '';

    const filtered = gymFoodDB.filter(item => {
        const matchCat = (cat === 'Tutti' || item.cat === cat);
        const matchQ = (!q || item.name.toLowerCase().includes(q));
        return matchCat && matchQ;
    });

    if (filtered.length === 0) {
        listEl.innerHTML = `<div class="text-xs text-slate-500 text-center py-4">Nessun prodotto fitness trovato.</div>`;
        return;
    }

    filtered.forEach(item => {
        const div = document.createElement('div');
        div.className = "p-2.5 hover:bg-slate-800 cursor-pointer flex justify-between items-center transition-colors";
        div.innerHTML = `<div>
            <div class="text-xs font-bold text-slate-200">${item.name}</div>
            <div class="text-[10px] text-slate-400">${item.desc} • P:${item.p}g C:${item.c}g G:${item.f}g</div>
        </div>
        <span class="text-xs font-bold text-emerald-400 shrink-0 ml-2">${item.kcal} kcal</span>`;
        div.onclick = () => selectGymFoodItem(item);
        listEl.appendChild(div);
    });
}

function selectGymFoodItem(item) {
    selectedGymFood = item;
    document.getElementById('selected-gym-food-name').innerText = item.name;
    document.getElementById('selected-gym-food-desc').innerText = item.desc;
    document.getElementById('gym-food-config').classList.remove('hidden');
    setGymMultiplier(1);
}

function setGymMultiplier(mult) {
    currentGymMultiplier = mult;
    [0.5, 1, 1.5, 2].forEach(m => {
        const btn = document.getElementById(`gym-mult-${m}`);
        if (m === mult) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    updateGymFoodPreview();
}

function getCalculatedGymMacros() {
    if (!selectedGymFood) return { kcal: 0, p: 0, c: 0, f: 0 };
    return {
        kcal: Math.round(selectedGymFood.kcal * currentGymMultiplier),
        p: Math.round(selectedGymFood.p * currentGymMultiplier),
        c: Math.round(selectedGymFood.c * currentGymMultiplier),
        f: Math.round(selectedGymFood.f * currentGymMultiplier)
    };
}

function updateGymFoodPreview() {
    const res = getCalculatedGymMacros();
    document.getElementById('gym-prev-kcal').innerText = res.kcal;
    document.getElementById('gym-prev-p').innerText = res.p + 'g';
    document.getElementById('gym-prev-c').innerText = res.c + 'g';
    document.getElementById('gym-prev-f').innerText = res.f + 'g';
}

function saveGymFoodMeal() {
    if (!selectedGymFood) return;
    const res = getCalculatedGymMacros();
    const mealType = document.getElementById('food-meal-type').value;

    const newEntry = {
        mealType: mealType,
        name: selectedGymFood.name,
        details: `Dose ${currentGymMultiplier}x`,
        kcal: res.kcal,
        p: res.p,
        c: res.c,
        f: res.f,
        isCheat: false,
        isGym: true
    };

    const key = getDietDateKey();
    let logs = JSON.parse(localStorage.getItem(key)) || [];
    logs.push(newEntry);
    localStorage.setItem(key, JSON.stringify(logs));
    closeFoodModal();
    renderNutritionDashboard();
}

// --- LOGICA TAB 4: SGARRO, FAST FOOD & ALCOLICI ---
function filterCheatFoodList() {
    const cat = document.getElementById('cheat-food-cat').value;
    const q = document.getElementById('cheat-food-search').value.toLowerCase().trim();
    const listEl = document.getElementById('cheat-food-list');
    listEl.innerHTML = '';

    const filtered = cheatFoodDB.filter(item => {
        const matchCat = (cat === 'Tutti' || item.cat === cat);
        const matchQ = (!q || item.name.toLowerCase().includes(q));
        return matchCat && matchQ;
    });

    if (filtered.length === 0) {
        listEl.innerHTML = `<div class="text-xs text-slate-500 text-center py-4">Nessuno sgarro o drink trovato.</div>`;
        return;
    }

    filtered.forEach(item => {
        const div = document.createElement('div');
        div.className = "p-2.5 hover:bg-slate-800 cursor-pointer flex justify-between items-center transition-colors";
        div.innerHTML = `<div>
            <div class="text-xs font-bold text-slate-200">${item.name}</div>
            <div class="text-[10px] text-slate-400">${item.cat} • P:${item.p}g C:${item.c}g G:${item.f}g</div>
        </div>
        <span class="text-xs font-bold text-orange-400 shrink-0 ml-2">${item.kcal} kcal</span>`;
        div.onclick = () => selectCheatFoodItem(item);
        listEl.appendChild(div);
    });
}

function selectCheatFoodItem(item) {
    selectedCheatFood = item;
    document.getElementById('selected-cheat-food-name').innerText = item.name;
    document.getElementById('selected-cheat-food-desc').innerText = item.desc;
    document.getElementById('cheat-food-config').classList.remove('hidden');

    // Se è un alcolico/drink, i pulsanti diventano "1 Drink", "2 Drink", "3 Drink" invece di "+ Menù Patatine"
    if (item.isDrink) {
        document.getElementById('cheat-combo-label').innerHTML = `<i class="fas fa-glass-martini-alt text-orange-400 mr-1"></i>Quanti bicchieri / drink hai bevuto?`;
        document.getElementById('cheat-lbl-single').innerText = "1 Bicchiere";
        document.getElementById('cheat-sub-single').innerText = "Dose singola";
        document.getElementById('cheat-lbl-medium').innerText = "2 Bicchieri";
        document.getElementById('cheat-sub-medium').innerText = "Doppio giro";
        document.getElementById('cheat-lbl-large').innerText = "3 Bicchieri";
        document.getElementById('cheat-sub-large').innerText = "Triplo giro";
    } else {
        document.getElementById('cheat-combo-label').innerHTML = `<i class="fas fa-utensils text-orange-400 mr-1"></i>Hai preso solo il piatto o il Menù completo?`;
        document.getElementById('cheat-lbl-single').innerText = "Singolo";
        document.getElementById('cheat-sub-single').innerText = "Solo prodotto";
        document.getElementById('cheat-lbl-medium').innerText = "+ Menù Medio";
        document.getElementById('cheat-sub-medium').innerText = "Patatine + Salse";
        document.getElementById('cheat-lbl-large').innerText = "+ Menù Grande";
        document.getElementById('cheat-sub-large').innerText = "Pat. Grandi + Bibita";
    }

    setCheatCombo('single');
}

function setCheatCombo(comboType) {
    currentCheatCombo = comboType;
    ['single', 'medium', 'large'].forEach(c => {
        const btn = document.getElementById(`cheat-combo-${c}`);
        if (c === comboType) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    updateCheatFoodPreview();
}

function getCalculatedCheatMacros() {
    if (!selectedCheatFood) return { kcal: 0, p: 0, c: 0, f: 0 };
    let kcal = selectedCheatFood.kcal;
    let p = selectedCheatFood.p;
    let c = selectedCheatFood.c;
    let f = selectedCheatFood.f;

    if (selectedCheatFood.isDrink) {
        const mult = currentCheatCombo === 'single' ? 1 : (currentCheatCombo === 'medium' ? 2 : 3);
        return { kcal: kcal * mult, p: p * mult, c: c * mult, f: f * mult };
    } else {
        if (currentCheatCombo === 'medium') {
            kcal += 380; p += 4; c += 46; f += 19;
        } else if (currentCheatCombo === 'large') {
            kcal += 640; p += 6; c += 96; f += 25;
        }
        return { kcal, p, c, f };
    }
}

function updateCheatFoodPreview() {
    const res = getCalculatedCheatMacros();
    document.getElementById('cheat-prev-kcal').innerText = res.kcal;
    document.getElementById('cheat-prev-p').innerText = res.p + 'g';
    document.getElementById('cheat-prev-c').innerText = res.c + 'g';
    document.getElementById('cheat-prev-f').innerText = res.f + 'g';
}

function saveCheatFoodMeal() {
    if (!selectedCheatFood) return;
    const res = getCalculatedCheatMacros();
    const mealType = document.getElementById('food-meal-type').value;

    let detailsText = '';
    if (selectedCheatFood.isDrink) {
        const drinkLabels = { 'single': '1 Bicchiere', 'medium': '2 Bicchieri', 'large': '3 Bicchieri' };
        detailsText = drinkLabels[currentCheatCombo];
    } else {
        const comboLabels = { 'single': 'Singolo', 'medium': '+ Menù Medio', 'large': '+ Menù Grande' };
        detailsText = comboLabels[currentCheatCombo];
    }

    const newEntry = {
        mealType: mealType,
        name: selectedCheatFood.name,
        details: detailsText,
        kcal: res.kcal,
        p: res.p,
        c: res.c,
        f: res.f,
        isCheat: true,
        isGym: false
    };

    const key = getDietDateKey();
    let logs = JSON.parse(localStorage.getItem(key)) || [];
    logs.push(newEntry);
    localStorage.setItem(key, JSON.stringify(logs));
    closeFoodModal();
    renderNutritionDashboard();
}

function deleteFoodLog(idx) {
    const key = getDietDateKey();
    let logs = JSON.parse(localStorage.getItem(key)) || [];
    logs.splice(idx, 1);
    localStorage.setItem(key, JSON.stringify(logs));
    renderNutritionDashboard();
}

// ==================== FUNZIONI CALENDARIO, SCHEDA E PROGRESSI ====================
function initCalendarDropdowns() {
    const yearSelect = document.getElementById('cal-year-select');
    if(!yearSelect) return;
    const currentYear = new Date().getFullYear();
    for(let y = currentYear - 5; y <= currentYear + 5; y++) {
        let opt = document.createElement('option');
        opt.value = y; opt.innerText = y; opt.className = "bg-slate-800 text-white";
        yearSelect.appendChild(opt);
    }
}

function openExportModal() {
    let backup = {};
    for (let i = 0; i < localStorage.length; i++) { backup[localStorage.key(i)] = localStorage.getItem(localStorage.key(i)); }
    document.getElementById('backup-text').value = JSON.stringify(backup);
    const btn = document.getElementById('backup-action-btn');
    btn.innerText = "Copia negli appunti";
    btn.onclick = () => {
        document.getElementById('backup-text').select();
        document.execCommand('copy');
        btn.innerText = "Copiato!";
        setTimeout(() => { btn.innerText = "Copia negli appunti"; }, 2000);
    };
    document.getElementById('backup-modal').classList.remove('hidden');
    document.getElementById('backup-modal').classList.add('flex');
}

function openImportModal() {
    document.getElementById('backup-text').value = "";
    const btn = document.getElementById('backup-action-btn');
    btn.innerText = "Ripristina Dati";
    btn.onclick = () => {
        const dataStr = document.getElementById('backup-text').value.trim();
        if(!dataStr) return;
        try {
            const backup = JSON.parse(dataStr);
            if (typeof backup === 'object') {
                showCustomConfirm("ATTENZIONE: Tutti i dati verranno sovrascritti. Procedere?", () => {
                    localStorage.clear();
                    for (let key in backup) { localStorage.setItem(key, backup[key]); }
                    alert("Dati ripristinati!");
                    location.reload();
                });
            }
        } catch(e) { alert("Errore durante l'importazione."); }
    };
    document.getElementById('backup-modal').classList.remove('hidden');
    document.getElementById('backup-modal').classList.add('flex');
}
function closeBackupModal() { document.getElementById('backup-modal').classList.add('hidden'); document.getElementById('backup-modal').classList.remove('flex'); }

function buildDaysNavigation() {
    const navContainer = document.getElementById('dynamic-nav-container');
    navContainer.innerHTML = '';
    const dayKeys = Object.keys(currentRoutine.days);
    dayKeys.forEach((dKey, index) => {
        const isOnlyDay = dayKeys.length === 1;
        navContainer.innerHTML += `<div class="flex items-center bg-transparent shrink-0"><button onclick="switchDayTab('${dKey}')" id="btn-${dKey}" class="nav-btn ${index === 0 ? 'active' : 'inactive'} pl-4 ${isOnlyDay ? 'pr-4' : 'pr-2'} py-2 rounded-full text-sm flex items-center gap-1.5 transition-colors"><span>${currentRoutine.days[dKey].title}</span>${!isOnlyDay ? `<span onclick="event.stopPropagation(); requestDeleteDay('${dKey}')" class="text-slate-400 hover:text-red-400 p-1 rounded-full flex items-center justify-center"><i class="fas fa-times text-xs"></i></span>` : ''}</button></div>`;
    });
    navContainer.innerHTML += `<button onclick="addNewDayToRoutine()" class="nav-btn inactive w-9 h-9 rounded-full text-sm shrink-0 flex items-center justify-center hover:bg-slate-700 transition-colors"><i class="fas fa-plus"></i></button>`;
}

function switchDayTab(dayKey) {
    document.querySelectorAll('.nav-btn').forEach(btn => { if (btn.id && btn.id.startsWith('btn-giorno')) { btn.classList.remove('active'); btn.classList.add('inactive'); } });
    const activeBtn = document.getElementById(`btn-${dayKey}`);
    if(activeBtn) { activeBtn.classList.remove('inactive'); activeBtn.classList.add('active'); }
    document.querySelectorAll('.giorno-tab').forEach(giorno => giorno.style.display = 'none');
    const targetGiorno = document.getElementById(`tab-${dayKey}`);
    if(targetGiorno) { targetGiorno.style.display = 'block'; targetGiorno.classList.add('active'); }
}

function reopenCurrentTab() {
    const activeSub = document.querySelector('.nav-btn.active');
    if(activeSub && activeSub.id.startsWith('btn-giorno')) { switchDayTab(activeSub.id.replace('btn-', '')); }
    else { switchDayTab(Object.keys(currentRoutine.days)[0]); }
}

function addNewDayToRoutine() {
    let nextNum = 1;
    while(currentRoutine.days[`giorno${nextNum}`]) { nextNum++; }
    const newDayKey = `giorno${nextNum}`;
    currentRoutine.days[newDayKey] = { title: `Giorno ${nextNum}`, desc: "Nuovo giorno personalizzato.", exercises: [] };
    saveAllRoutines(); buildDaysNavigation(); renderWorkouts(); renderProgressioni(); switchDayTab(newDayKey);
}

function requestDeleteDay(dk) {
    showCustomConfirm("Vuoi eliminare l'intera giornata?", () => {
        delete currentRoutine.days[dk];
        let newDays = {}; let counter = 1;
        for (const oldKey in currentRoutine.days) {
            let newKey = `giorno${counter}`;
            let dayData = currentRoutine.days[oldKey];
            if (dayData.title.startsWith("Giorno ")) { dayData.title = `Giorno ${counter}`; }
            newDays[newKey] = dayData;
            if (oldKey !== newKey) {
                let oldOrder = localStorage.getItem(`order-${activeRoutineId}-${oldKey}`);
                if (oldOrder) { localStorage.setItem(`order-${activeRoutineId}-${newKey}`, oldOrder); localStorage.removeItem(`order-${activeRoutineId}-${oldKey}`); }
            }
            counter++;
        }
        currentRoutine.days = newDays;
        saveAllRoutines(); buildDaysNavigation(); renderWorkouts(); renderProgressioni();
        const firstDay = Object.keys(currentRoutine.days)[0];
        if (firstDay) { switchDayTab(firstDay); }
    });
}

function renderMeasurements() {
    const c = document.getElementById('measurements-history');
    const hist = JSON.parse(localStorage.getItem('measurements_history')) || [];
    c.innerHTML = '';
    if (hist.length === 0) {
        c.innerHTML = `<div class="text-xs text-slate-500 text-center py-4 bg-slate-800 rounded-xl border border-slate-700">Nessuna misurazione salvata.</div>`;
        return;
    }
    hist.forEach((m, i) => {
        const dets = [ m.spalle?`<span class="text-slate-400">Spalle:</span> ${m.spalle}cm`:'', m.petto?`<span class="text-slate-400">Petto:</span> ${m.petto}cm`:'', m.braccia?`<span class="text-slate-400">Braccia:</span> ${m.braccia}cm`:'', m.vita?`<span class="text-slate-400">Vita:</span> ${m.vita}cm`:'', m.fianchi?`<span class="text-slate-400">Fianchi:</span> ${m.fianchi}cm`:'', m.cosce?`<span class="text-slate-400">Cosce:</span> ${m.cosce}cm`:'', m.polpacci?`<span class="text-slate-400">Polpacci:</span> ${m.polpacci}cm`:'' ].filter(d => d!=='').join(' • ');
        c.innerHTML += `<div class="bg-slate-900 rounded-xl p-3 border border-slate-700 flex justify-between items-start"><div><div class="text-xs font-bold text-blue-400 mb-1">${formatDate(m.date)}</div><div class="text-xs text-slate-200 leading-relaxed">${dets}</div></div><button onclick="deleteMeasurement(${i})" class="text-slate-600 hover:text-red-500 p-1 ml-2"><i class="fas fa-trash"></i></button></div>`;
    });
}
function deleteMeasurement(i) { showCustomConfirm("Eliminare la misurazione?", () => { let hist = JSON.parse(localStorage.getItem('measurements_history')) || []; hist.splice(i, 1); localStorage.setItem('measurements_history', JSON.stringify(hist)); renderMeasurements(); }); }

function openRoutinesManager() { renderRoutinesList(); document.getElementById('routines-modal').classList.remove('hidden'); document.getElementById('routines-modal').classList.add('flex'); }
function closeRoutinesManager() { document.getElementById('routines-modal').classList.add('hidden'); document.getElementById('routines-modal').classList.remove('flex'); }
function renderRoutinesList() {
    const lc = document.getElementById('routines-list-container'); lc.innerHTML = '';
    for (const [rId, rData] of Object.entries(allRoutines)) {
        const isActive = rId === activeRoutineId;
        const dCount = Object.keys(rData.days).length;
        lc.innerHTML += `<div onclick="switchActiveRoutine('${rId}')" class="bg-slate-900 border ${isActive ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-700 hover:border-slate-500'} cursor-pointer rounded-xl p-3 flex items-center justify-between"><div><h4 class="font-bold text-slate-100">${rData.name} ${isActive ? '<span class="text-xs bg-blue-600 text-white px-2 py-0.5 rounded ml-2">Attiva</span>' : ''}</h4><p class="text-xs text-slate-400 mt-0.5">${dCount} giorni</p></div><div class="flex items-center gap-2">${Object.keys(allRoutines).length > 1 ? `<button onclick="event.stopPropagation(); deleteRoutine('${rId}')" class="text-red-500 hover:text-red-400 p-2"><i class="fas fa-trash"></i></button>` : ''}</div></div>`;
    }
}
function switchActiveRoutine(rId) { activeRoutineId=rId; currentRoutine=allRoutines[rId]; saveAllRoutines(); closeRoutinesManager(); document.getElementById('main-header-title').innerText = currentRoutine.name; buildDaysNavigation(); renderWorkouts(); renderProgressioni(); switchDayTab(Object.keys(currentRoutine.days)[0]); }
function createNewRoutine() {
    const n = document.getElementById('new-routine-name').value;
    const dc = parseInt(document.getElementById('new-routine-days').value)||4;
    if(!n) return alert("Inserisci un nome.");
    const nId = 'routine-'+Date.now();
    let nDays = {};
    for(let i=1; i<=dc; i++) nDays[`giorno${i}`] = { title: `Giorno ${i}`, desc: "Giorno personalizzato.", exercises: [] };
    allRoutines[nId] = { name: n, days: nDays }; activeRoutineId = nId; currentRoutine = allRoutines[nId];
    saveAllRoutines(); closeRoutinesManager(); document.getElementById('main-header-title').innerText = currentRoutine.name; buildDaysNavigation(); renderWorkouts(); renderProgressioni(); switchDayTab('giorno1');
}
function deleteRoutine(rId) { showCustomConfirm("Eliminare scheda?", () => { delete allRoutines[rId]; activeRoutineId=Object.keys(allRoutines)[0]; currentRoutine=allRoutines[activeRoutineId]; saveAllRoutines(); renderRoutinesList(); closeRoutinesManager(); document.getElementById('main-header-title').innerText = currentRoutine.name; buildDaysNavigation(); renderWorkouts(); renderProgressioni(); switchDayTab(Object.keys(currentRoutine.days)[0]); }); }

function handleExerciseSearch(q) {
    const dp = document.getElementById('add-ex-dropdown'); dp.innerHTML = ''; selectedDbExercise = null;
    if (!q || q.trim().length<2) { dp.classList.add('hidden'); return; }
    const res = exerciseDB.filter(ex => ex.name.toLowerCase().includes(q.toLowerCase()));
    if(res.length>0) {
        res.forEach(r => {
            const i=document.createElement('div'); i.className="px-3 py-2 border-b border-slate-600 hover:bg-slate-600 cursor-pointer text-sm text-slate-200"; i.innerText=r.name;
            i.onclick=()=>selectExerciseFromDb(r); dp.appendChild(i);
        });
        dp.classList.remove('hidden');
    } else dp.classList.add('hidden');
}
function selectExerciseFromDb(obj) { document.getElementById('add-ex-name').value = obj.name; document.getElementById('add-ex-dropdown').classList.add('hidden'); selectedDbExercise = obj; }
function openAddModal(dk) { document.getElementById('add-ex-day').value=dk; document.getElementById('add-ex-name').value=''; document.getElementById('add-ex-dropdown').classList.add('hidden'); document.getElementById('add-ex-sets').value='3'; document.getElementById('add-ex-reps').value='10'; document.getElementById('add-ex-rest').value='90'; selectedDbExercise=null; document.getElementById('add-ex-modal').classList.remove('hidden'); document.getElementById('add-ex-modal').classList.add('flex'); }
function closeAddModal() { document.getElementById('add-ex-modal').classList.add('hidden'); document.getElementById('add-ex-modal').classList.remove('flex'); }
function openLibraryModal() { renderLibrary(); document.getElementById('library-modal').classList.remove('hidden'); document.getElementById('library-modal').classList.add('flex'); }
function closeLibraryModal() { document.getElementById('library-modal').classList.add('hidden'); document.getElementById('library-modal').classList.remove('flex'); }

function renderLibrary() {
    const container = document.getElementById('library-list-container'); container.innerHTML = '';
    const grouped = {};
    exerciseDB.forEach(ex => { const cat = ex.category || "Altri"; if(!grouped[cat]) grouped[cat] = []; grouped[cat].push(ex); });
    for (const [cat, exList] of Object.entries(grouped)) {
        const safeCat = cat.replace(/\s/g, '');
        let html = `<div class="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"><button onclick="toggleAccordion('cat-${safeCat}')" class="w-full flex justify-between items-center p-4 bg-slate-800 hover:bg-slate-700 text-left font-bold text-slate-200 transition-colors outline-none">${cat}<i class="fas fa-chevron-down text-slate-400 transition-transform" id="cat-${safeCat}-icon"></i></button><div id="cat-${safeCat}" class="accordion-content bg-slate-900/50"><div class="flex flex-col">`;
        exList.forEach(ex => { html += `<div onclick="selectFromLibrary('${ex.name}')" class="p-3 border-t border-slate-700/50 text-sm text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer transition-colors pl-6">${ex.name}</div>`; });
        html += `</div></div></div>`; container.innerHTML += html;
    }
}
function selectFromLibrary(exName) { const ex = exerciseDB.find(e => e.name === exName); if (ex) { selectExerciseFromDb(ex); closeLibraryModal(); } }

function saveNewExercise() {
    const dk=document.getElementById('add-ex-day').value;
    const n=document.getElementById('add-ex-name').value.trim();
    if(!n) return alert("Inserisci nome.");
    const existingIdx = currentRoutine.days[dk].exercises.findIndex(e => e.name.toLowerCase() === n.toLowerCase() && e.deletedFromRoutine);
    if (existingIdx !== -1) {
        currentRoutine.days[dk].exercises[existingIdx].deletedFromRoutine = false;
    } else {
        let nEx = { id: 'custom-'+Date.now(), name: n, defaultSets: document.getElementById('add-ex-sets').value||'3', defaultReps: document.getElementById('add-ex-reps').value||'10', defaultRest: document.getElementById('add-ex-rest').value||'90', tech: "Esercizio personalizzato.", muscles: {} };
        if(selectedDbExercise && selectedDbExercise.name===n) { nEx.tech=selectedDbExercise.tech; nEx.muscles=selectedDbExercise.muscles; }
        currentRoutine.days[dk].exercises.push(nEx);
    }
    saveAllRoutines(); closeAddModal(); renderWorkouts(); renderProgressioni(); switchDayTab(dk);
}

function requestDeleteFromRoutine(dk, eId) {
    showCustomConfirm("Eliminare questo esercizio dalla scheda?", () => {
        const i = currentRoutine.days[dk].exercises.findIndex(e=>e.id===eId);
        if(i!==-1) {
            if (currentRoutine.days[dk].exercises[i].isSwapSub) {
                currentRoutine.days[dk].exercises.splice(i, 1);
            } else {
                currentRoutine.days[dk].exercises[i].deletedFromRoutine = true;
            }
            saveAllRoutines(); renderWorkouts(); renderProgressioni(); switchDayTab(dk);
        }
    });
}
function requestDeleteHistory(hk, eId) { showCustomConfirm("Cancellare lo storico per questo esercizio?", () => { localStorage.removeItem(hk); renderProgressioni(); renderMonthlyCalendar(); const cc=document.getElementById(`chart-container-${eId}`); if(cc&&!cc.classList.contains('hidden')) toggleChart(eId, hk); }); }
function showCustomConfirm(msg, cb) { document.getElementById('confirm-msg').innerText=msg; confirmCallback=cb; document.getElementById('custom-confirm-modal').classList.remove('hidden'); document.getElementById('custom-confirm-modal').classList.add('flex'); }
function closeConfirm() { document.getElementById('custom-confirm-modal').classList.add('hidden'); document.getElementById('custom-confirm-modal').classList.remove('flex'); confirmCallback=null; }
function confirmYes() { if(confirmCallback) confirmCallback(); closeConfirm(); }

// ==================== FILTRO DOMS E MACCHINARIO OCCUPATO ====================
function openDomsModal() { document.getElementById('doms-modal').classList.remove('hidden'); document.getElementById('doms-modal').classList.add('flex'); }
function closeDomsModal() { document.getElementById('doms-modal').classList.add('hidden'); document.getElementById('doms-modal').classList.remove('flex'); }

function applyDomsFilter() {
    currentDomsFilters = Array.from(document.querySelectorAll('.doms-chk:checked')).map(cb => cb.value);
    closeDomsModal(); renderWorkouts(); renderProgressioni(); reopenCurrentTab();
}
function removeDomsFilter() {
    currentDomsFilters = [];
    document.querySelectorAll('.doms-chk').forEach(cb => cb.checked = false);
    closeDomsModal(); renderWorkouts(); renderProgressioni(); reopenCurrentTab();
}
function isHitByDoms(exMuscles) {
    if (!exMuscles || currentDomsFilters.length === 0) return false;
    for (let m of currentDomsFilters) { if (exMuscles[m] >= 1) return true; }
    return false;
}
function findDomsSubstitute(originalEx, dayExercises) {
    let dayMuscles = new Set();
    dayExercises.forEach(e => { if (e.muscles) Object.keys(e.muscles).forEach(m => dayMuscles.add(m)); });
    currentDomsFilters.forEach(m => dayMuscles.delete(m));

    let candidates = exerciseDB.filter(dbEx => {
        if (isHitByDoms(dbEx.muscles)) return false;
        let hitsAllowedMuscle = false;
        if (dbEx.muscles) { for (let m of dayMuscles) { if (dbEx.muscles[m] >= 1) { hitsAllowedMuscle = true; break; } } }
        return hitsAllowedMuscle;
    });

    if (candidates.length === 0) return { name: "Recupero / Stretching", tech: "I tuoi muscoli hanno bisogno di riposo.", muscles: {} };
    return candidates[0];
}

function openSwapModal(dk, exId) {
    const ex = currentRoutine.days[dk].exercises.find(e => e.id === exId);
    let primary = null; let max = 0;
    if(ex.muscles) { for(const [m, sc] of Object.entries(ex.muscles)) { if(sc > max) { max = sc; primary = m; } } }
    
    const listEl = document.getElementById('swap-list'); listEl.innerHTML = '';
    if(!primary) {
        listEl.innerHTML = '<p class="text-sm text-slate-400">Nessuna alternativa trovata per questo esercizio personalizzato.</p>';
    } else {
        let alts = exerciseDB.filter(e => e.name !== ex.name && e.muscles && e.muscles[primary] >= 2);
        alts.forEach(alt => {
            listEl.innerHTML += `<div class="bg-slate-900 p-3 rounded-lg border border-slate-700/50 mb-2 flex justify-between items-center"><span class="text-sm text-slate-200 font-bold">${alt.name}</span><button onclick="confirmSwap('${dk}', '${exId}', '${alt.name.replace(/'/g, "\\'")}')" class="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-lg text-xs font-bold text-white transition-colors shadow">Scegli</button></div>`;
        });
    }
    document.getElementById('swap-modal').classList.remove('hidden'); document.getElementById('swap-modal').classList.add('flex');
}
function closeSwapModal() { document.getElementById('swap-modal').classList.add('hidden'); document.getElementById('swap-modal').classList.remove('flex'); }

function confirmSwap(dk, exId, newName) {
    let dbEx = exerciseDB.find(e => e.name === newName);
    if(dbEx) {
        const targetDate = document.getElementById('prog-date').value || new Date().toISOString().split('T')[0];
        let origEx = currentRoutine.days[dk].exercises.find(e => e.id === exId);
        let nEx = {
            id: 'swap-'+Date.now(),
            name: dbEx.name,
            defaultSets: origEx ? origEx.defaultSets : '3',
            defaultReps: origEx ? origEx.defaultReps : '10',
            defaultRest: origEx ? origEx.defaultRest : '90',
            tech: dbEx.tech,
            muscles: dbEx.muscles,
            isSwapSub: true,
            swapDate: targetDate
        };
        let idx = currentRoutine.days[dk].exercises.findIndex(e => e.id === exId);
        if(idx !== -1) currentRoutine.days[dk].exercises.splice(idx + 1, 0, nEx);
        else currentRoutine.days[dk].exercises.push(nEx);

        saveAllRoutines(); renderWorkouts(); renderProgressioni(); switchDayTab(dk); closeSwapModal();
    }
}

function renderWorkouts() {
    const c = document.getElementById('workout-container'); c.innerHTML = '';
    const targetDate = document.getElementById('prog-date').value || new Date().toISOString().split('T')[0];

    for (const [key, data] of Object.entries(currentRoutine.days)) {
        let sOrder = JSON.parse(localStorage.getItem(`order-${activeRoutineId}-${key}`));
        let eList = data.exercises.filter(ex => {
            if (ex.deletedFromRoutine) return false;
            if (ex.isSwapSub && ex.swapDate !== targetDate) return false;
            return true;
        });

        if(sOrder) { eList.sort((a,b)=>{ let iA=sOrder.indexOf(a.id); let iB=sOrder.indexOf(b.id); return (iA===-1?999:iA)-(iB===-1?999:iB); }); }
        
        let displayList = [];
        eList.forEach(ex => {
            if(currentDomsFilters.length > 0 && isHitByDoms(ex.muscles)) {
                let sub = findDomsSubstitute(ex, eList);
                displayList.push({...sub, id: ex.id, isDomsSub: true, originalName: ex.name, defaultSets: ex.defaultSets, defaultReps: ex.defaultReps, defaultRest: ex.defaultRest});
            } else {
                displayList.push(ex);
            }
        });

        const filterBtnClass = currentDomsFilters.length > 0 ? 'bg-yellow-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-blue-400';
        
        let html = `<div id="tab-${key}" class="giorno-tab tab-content">
            <div class="mb-6 flex justify-between items-start">
                <div><h2 class="text-lg font-bold text-blue-400 mb-1">${data.title}</h2><p class="text-sm text-slate-400">${data.desc}</p></div>
                <div class="flex gap-2">
                    <button onclick="openDomsModal()" class="${filterBtnClass} rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-colors"><i class="fas fa-filter"></i></button>
                    <button onclick="openAddModal('${key}')" class="bg-blue-600 hover:bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"><i class="fas fa-plus"></i></button>
                </div>
            </div>
            <div class="space-y-4" id="list-${key}">`;
            
        if (displayList.length === 0) {
            html += `<div class="text-center text-sm text-slate-500 py-10 bg-slate-800 rounded-xl border border-slate-700 border-dashed">Nessun esercizio. Premi il tasto <i class="fas fa-plus mx-1 text-blue-400"></i> per aggiungerne uno.</div>`;
} else {
            displayList.forEach(ex => {
                let badge = '';
                if(ex.isDomsSub) badge = `<span class="bg-yellow-600 text-white text-[9px] px-2 py-0.5 rounded ml-2 shadow whitespace-nowrap">SOSTITUTIVO (DOMS)</span>`;
                else if(ex.isSwapSub) badge = `<span class="bg-yellow-600 text-white text-[9px] px-2 py-0.5 rounded ml-2 shadow whitespace-nowrap">SOSTITUTIVO</span>`;
                
                let isSub = ex.isDomsSub || ex.isSwapSub;
                let borderColor = isSub ? 'border-yellow-600/50' : 'border-slate-700';
                
                html += `<div class="bg-slate-800 rounded-xl overflow-hidden shadow-lg border ${borderColor} flex flex-col draggable-item" data-id="${ex.id}">
                    <div class="flex items-stretch border-b border-slate-700/50 bg-slate-800/80">
                        <div class="drag-handle w-12 flex items-center justify-center cursor-grab bg-slate-800/50 border-r border-slate-700 text-slate-500"><i class="fas fa-grip-vertical text-xl"></i></div>
                        <div class="p-4 flex-1 flex items-center justify-between cursor-pointer" onclick="toggleAccordion('${ex.id}-acc')">
                            <h3 class="font-semibold text-slate-100 flex-1 flex flex-wrap items-center gap-1">${ex.name} ${badge}</h3>
                            <div class="flex items-center gap-2">
                                ${!isSub ? `<button onclick="event.stopPropagation(); openSwapModal('${key}', '${ex.id}')" title="Macchinario occupato" class="text-blue-400 w-8 h-8 rounded-full bg-slate-900/50 hover:bg-slate-700 flex items-center justify-center"><i class="fas fa-exchange-alt text-xs"></i></button>` : ''}
                                <button onclick="event.stopPropagation(); requestDeleteFromRoutine('${key}', '${ex.id}')" class="text-red-500 w-8 h-8 rounded-full bg-slate-900/50 flex items-center justify-center"><i class="fas fa-times text-sm"></i></button>
                                <div class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700 text-slate-300"><i class="fas fa-chevron-down text-sm" id="${ex.id}-acc-icon"></i></div>
                            </div>
                        </div>
                    </div>
                    <div id="${ex.id}-acc" class="accordion-content bg-slate-800/50 px-4">
                        <div class="py-3 text-sm text-slate-300">
                            ${ex.isDomsSub ? `<span class="text-yellow-500 font-semibold text-xs block mb-1">Sostituisce: ${ex.originalName}</span>` : ''}
                            <span class="text-blue-400 font-semibold text-xs block">Esecuzione:</span>${ex.tech}
                        </div>
                    </div>
                    <div class="flex border-t border-slate-700 bg-slate-900/50 p-3">
                        <div class="flex-1 flex flex-col items-center border-r border-slate-700">
                            <span class="text-xs text-slate-400 mb-1">Serie x Rip</span>
                            <div class="flex items-center gap-2"><span id="${ex.id}-sr-display" class="font-medium text-slate-200 text-lg">${localStorage.getItem(`${ex.id}-sets`)||ex.defaultSets}x${localStorage.getItem(`${ex.id}-reps`)||ex.defaultReps}</span><input type="text" id="${ex.id}-sr-input" class="editable-input hidden text-lg" value="${localStorage.getItem(`${ex.id}-sets`)||ex.defaultSets}x${localStorage.getItem(`${ex.id}-reps`)||ex.defaultReps}" onblur="saveSR('${ex.id}')" onkeypress="handleEnter(event, this)"><button onclick="editSR('${ex.id}')" class="text-slate-500 hover:text-blue-400"><i class="fas fa-pen"></i></button></div>
                        </div>
                        <div class="flex-1 flex flex-col items-center">
                            <span class="text-xs text-slate-400 mb-1">Recupero</span>
                            <div class="flex items-center gap-2"><span id="${ex.id}-rest-display" class="font-medium text-slate-200 text-lg">${localStorage.getItem(`${ex.id}-rest`)||ex.defaultRest}"</span><input type="text" id="${ex.id}-rest-input" class="editable-input hidden text-lg" value="${localStorage.getItem(`${ex.id}-rest`)||ex.defaultRest}" onblur="saveRest('${ex.id}')" onkeypress="handleEnter(event, this)"><button onclick="editRest('${ex.id}')" class="text-slate-500 hover:text-blue-400"><i class="fas fa-pen"></i></button></div>
                        </div>
                    </div>
                </div>`;
            });
        }
        html += `</div></div>`; c.innerHTML += html;
    }
    Object.keys(currentRoutine.days).forEach(k => {
        const l=document.getElementById(`list-${k}`);
        if(l) new Sortable(l, { handle:'.drag-handle', animation:150, ghostClass:'sortable-ghost', onEnd:function(){ const nO=Array.from(l.querySelectorAll('.draggable-item')).map(i=>i.getAttribute('data-id')); localStorage.setItem(`order-${activeRoutineId}-${k}`, JSON.stringify(nO)); renderProgressioni(); }});
    });
}

function toggleAccordion(id) { const c=document.getElementById(id); const i=document.getElementById(id+'-icon'); if(c.classList.contains('open')){c.classList.remove('open');if(i)i.style.transform='rotate(0deg)';}else{c.classList.add('open');if(i)i.style.transform='rotate(180deg)';} }
function editSR(id) { document.getElementById(`${id}-sr-display`).classList.add('hidden'); const i=document.getElementById(`${id}-sr-input`); i.classList.remove('hidden'); i.focus(); }
function saveSR(id) { const v=document.getElementById(`${id}-sr-input`).value; localStorage.setItem(`${id}-sets`, v.split('x')[0]||"0"); localStorage.setItem(`${id}-reps`, v.split('x')[1]||"0"); document.getElementById(`${id}-sr-display`).innerText=v; document.getElementById(`${id}-sr-input`).classList.add('hidden'); document.getElementById(`${id}-sr-display`).classList.remove('hidden'); }
function editRest(id) { document.getElementById(`${id}-rest-display`).classList.add('hidden'); const i=document.getElementById(`${id}-rest-input`); i.classList.remove('hidden'); i.focus(); }
function saveRest(id) { const v=document.getElementById(`${id}-rest-input`).value.replace('"',''); localStorage.setItem(`${id}-rest`, v); document.getElementById(`${id}-rest-display`).innerText=v+'"'; document.getElementById(`${id}-rest-input`).classList.add('hidden'); document.getElementById(`${id}-rest-display`).classList.remove('hidden'); }
function handleEnter(e, el) { if(e.key==='Enter') el.blur(); }

function renderProgressioni() {
    const c = document.getElementById('prog-list'); c.innerHTML='';
    const targetDate = document.getElementById('prog-date').value;
    
    for (const [dk, data] of Object.entries(currentRoutine.days)) {
        let sO = JSON.parse(localStorage.getItem(`order-${activeRoutineId}-${dk}`));
        let eList = data.exercises.filter(ex => {
            if (ex.isSwapSub && ex.swapDate !== targetDate) return false;
            return true;
        });
        if(sO) eList.sort((a,b)=>{let iA=sO.indexOf(a.id);let iB=sO.indexOf(b.id);return (iA===-1?999:iA)-(iB===-1?999:iB);});
        
        let displayList = [];
        eList.forEach(ex => {
            if(currentDomsFilters.length > 0 && isHitByDoms(ex.muscles)) {
                let sub = findDomsSubstitute(ex, eList);
                displayList.push({...sub, id: ex.id, isDomsSub: true, originalName: ex.name, deletedFromRoutine: ex.deletedFromRoutine});
            } else {
                displayList.push(ex);
            }
        });
        
        exerciseDB.forEach(dbEx => {
            const hk = getHistKey(dbEx.name);
            const hist = JSON.parse(localStorage.getItem(hk)) || [];
            const logsForDate = hist.filter(h => h.date === targetDate && h.isSubstitute);
            if (logsForDate.length > 0) {
                if (!displayList.some(e => e.name === dbEx.name)) {
                    displayList.push({...dbEx, id: 'hist-sub-'+Math.random(), isPastSub: true});
                }
            }
        });
        
        let activeNames = displayList.filter(e => !e.deletedFromRoutine && !e.isPastSub).map(e => e.name);
        let vE = displayList.filter(ex=>{
            const h = JSON.parse(localStorage.getItem(getHistKey(ex.name)))||[];
            if (!ex.deletedFromRoutine || ex.isPastSub) return true;
            return h.length > 0 && !activeNames.includes(ex.name);
        });
        
        if(vE.length===0) continue;
        let dHtml=`<div class="mb-8"><div class="flex items-center gap-2 mb-3"><div class="h-px bg-slate-700 flex-1"></div><h3 class="text-xs font-bold text-slate-400">${data.title}</h3><div class="h-px bg-slate-700 flex-1"></div></div><div class="space-y-4">`;
        vE.forEach(ex => {
            const hk = getHistKey(ex.name);
            const h = JSON.parse(localStorage.getItem(hk))||[]; let hH='';
            if(h.length>0) { h.forEach((l,i)=>{ hH+=`<div class="flex justify-between items-center text-sm border-b border-slate-700/50 py-2 w-full"><div class="flex-1"><div class="flex justify-between"><span class="text-slate-400 text-xs">${formatDate(l.date)}</span><span class="text-blue-300 font-medium">${l.sets}x${l.reps}</span><span class="font-bold text-slate-200">${l.weight} kg</span></div>${l.note?`<div class="text-xs text-slate-500 italic mt-1">${l.note}</div>`:''}</div><button onclick="deleteLog('${hk}', ${i})" class="text-red-500 p-1 ml-2"><i class="fas fa-times"></i></button></div>`; }); }
            else { hH=`<div class="text-xs text-slate-500 text-center py-2">Nessun dato.</div>`; }
            
            let badgeHtml = (ex.isDomsSub || ex.isPastSub || ex.isSwapSub) ? `<span class="ml-2 text-[10px] bg-yellow-500 text-slate-900 font-bold px-2 py-0.5 rounded shadow">SOSTITUTIVO</span>` : '';
            if(ex.deletedFromRoutine && !ex.isPastSub && !ex.isDomsSub && !ex.isSwapSub) badgeHtml = `<span class="ml-2 text-[10px] bg-red-900/50 text-red-300 px-2 rounded">RIMOSSO</span>`;

            dHtml+=`<div class="bg-slate-800 rounded-xl p-4 border ${ex.isDomsSub || ex.isPastSub || ex.isSwapSub ? 'border-yellow-600/50' : 'border-slate-700'} ${ex.deletedFromRoutine && !ex.isPastSub?'opacity-75':''}"><div class="flex justify-between items-start mb-3"><h4 class="font-semibold text-slate-200">${ex.name}${badgeHtml}</h4><button onclick="requestDeleteHistory('${hk}', '${ex.id}')" class="text-slate-500 hover:text-red-500 p-1"><i class="fas fa-trash-alt"></i></button></div>
            <div class="grid grid-cols-3 gap-2 mb-2"><div><label class="text-[10px] text-slate-400 mb-1 block">Serie</label><input type="number" id="inp-sets-${ex.id}" class="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-center"></div><div><label class="text-[10px] text-slate-400 mb-1 block">Reps</label><input type="number" id="inp-reps-${ex.id}" class="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-center"></div><div><label class="text-[10px] text-slate-400 mb-1 block">Kg</label><input type="number" id="inp-weight-${ex.id}" class="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-center"></div></div>
            <div class="flex items-start gap-2 mb-4"><div class="flex-1"><div class="text-xs text-slate-400 cursor-pointer mb-1" onclick="toggleNote('note-${ex.id}')"><i class="fas fa-pen"></i> Aggiungi nota</div><input type="text" id="note-${ex.id}" class="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-xs hidden"></div><button onclick="saveProgression('${ex.id}', '${hk}', ${ex.isDomsSub || ex.isPastSub || ex.isSwapSub || false})" id="btn-save-${ex.id}" class="bg-blue-600 text-white rounded p-2 px-4 mt-[18px]"><i class="fas fa-save"></i> Salva</button></div>
            <div class="bg-slate-900 rounded-lg p-3 border border-slate-700/50 mb-3">${hH}</div>
            <div class="border-t border-slate-700 pt-2"><button onclick="toggleChart('${ex.id}', '${hk}')" class="w-full text-center text-sm text-blue-400"><i class="fas fa-chart-line"></i> Grafico</button><div id="chart-container-${ex.id}" class="hidden mt-3 bg-slate-900 p-2 rounded"><canvas id="chart-${ex.id}"></canvas></div></div></div>`;
        });
        dHtml+=`</div></div>`; c.innerHTML+=dHtml;
    }
}
function toggleNote(id) { const el=document.getElementById(id); el.classList.toggle('hidden'); if(!el.classList.contains('hidden')) el.focus(); }

function saveProgression(exId, hk, isSubstitute) {
    const d=document.getElementById('prog-date').value; const s=document.getElementById(`inp-sets-${exId}`).value; const r=document.getElementById(`inp-reps-${exId}`).value; const w=document.getElementById(`inp-weight-${exId}`).value; const n=document.getElementById(`note-${exId}`).value; const b=document.getElementById(`btn-save-${exId}`);
    if(!d||!s||!r||!w){ b.classList.replace('bg-blue-600','bg-red-600'); setTimeout(()=>b.classList.replace('bg-red-600','bg-blue-600'),1500); return; }
    let h=JSON.parse(localStorage.getItem(hk))||[];
    h.unshift({date:d, sets:s, reps:r, weight:w, note:n, isSubstitute: !!isSubstitute});
    h.sort((a,b)=>new Date(b.date)-new Date(a.date)); localStorage.setItem(hk, JSON.stringify(h));
    renderProgressioni(); renderMonthlyCalendar();
}
function deleteLog(hk, i) { let h=JSON.parse(localStorage.getItem(hk))||[]; h.splice(i,1); localStorage.setItem(hk, JSON.stringify(h)); renderProgressioni(); renderMonthlyCalendar(); }
function formatDate(ds) { if(!ds) return ''; const p = ds.split('-'); if(p.length===3) return `${p[2]}/${p[1]}`; const d=new Date(ds); return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}`; }
function toggleChart(eId, hk) { const c=document.getElementById(`chart-container-${eId}`); if(c.classList.contains('hidden')){c.classList.remove('hidden');renderChart(eId, hk);}else{c.classList.add('hidden');if(chartInstances[eId])chartInstances[eId].destroy();} }
function renderChart(eId, hk) {
    let h=JSON.parse(localStorage.getItem(hk))||[]; if(h.length===0)return; let cD=[...h].sort((a,b)=>new Date(a.date)-new Date(b.date)); const l=[],d1=[],dV=[];
    cD.forEach(x=>{ l.push(formatDate(x.date)); const p=parseFloat(x.weight), r=parseFloat(x.reps), s=parseFloat(x.sets); d1.push((p*(1+(r/30))).toFixed(1)); dV.push((s*r*p).toFixed(0)); });
    const ctx=document.getElementById(`chart-${eId}`).getContext('2d'); if(chartInstances[eId])chartInstances[eId].destroy();
    chartInstances[eId]=new Chart(ctx,{type:'line',data:{labels:l,datasets:[{label:'1RM',data:d1,borderColor:'#3b82f6',yAxisID:'y'},{label:'Vol',data:dV,borderColor:'#f59e0b',yAxisID:'y1'}]},options:{responsive:true,scales:{y:{type:'linear',position:'left'},y1:{type:'linear',position:'right',grid:{drawOnChartArea:false}}}}});
}

function getWorkoutDates() { let dates = new Set(); for (let i = 0; i < localStorage.length; i++) { let key = localStorage.key(i); if (key.startsWith('hist_')) { let history = JSON.parse(localStorage.getItem(key)) || []; history.forEach(log => dates.add(log.date)); } } return dates; }
function jumpToDate() { const m = parseInt(document.getElementById('cal-month-select').value); const y = parseInt(document.getElementById('cal-year-select').value); calCurrentDate.setMonth(m); calCurrentDate.setFullYear(y); document.getElementById('cal-selected-info').classList.add('hidden'); document.getElementById('cal-selected-info').classList.remove('flex'); renderMonthlyCalendar(); }
function changeCalendarMonth(direction) { calCurrentDate.setMonth(calCurrentDate.getMonth() + direction); document.getElementById('cal-selected-info').classList.add('hidden'); document.getElementById('cal-selected-info').classList.remove('flex'); renderMonthlyCalendar(); }
function renderMonthlyCalendar() {
    const y = calCurrentDate.getFullYear(); const m = calCurrentDate.getMonth();
    const monthSelect = document.getElementById('cal-month-select'); const yearSelect = document.getElementById('cal-year-select');
    if (monthSelect) monthSelect.value = m; if (yearSelect && yearSelect.querySelector(`option[value="${y}"]`)) { yearSelect.value = y; }
    const firstDay = new Date(y, m, 1).getDay(); const daysInMonth = new Date(y, m + 1, 0).getDate();
    let startDay = firstDay === 0 ? 6 : firstDay - 1;
    const grid = document.getElementById('monthly-calendar-grid'); grid.innerHTML = '';
    const workedOutDates = getWorkoutDates();
    for(let i=0; i<startDay; i++) { grid.innerHTML += `<div></div>`; }
    for(let d=1; d<=daysInMonth; d++) {
        let dateStr = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        let isActive = workedOutDates.has(dateStr);
        let classes = isActive ? 'bg-green-500 text-white font-bold hover:scale-110 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'text-slate-400 bg-slate-900/50 border border-slate-700/50 hover:bg-slate-700';
        let dayHtml = `<div class="aspect-square flex items-center justify-center rounded-full cursor-pointer transition-all ${classes}" onclick="selectCalendarDate('${dateStr}', ${isActive})">${d}</div>`;
        grid.innerHTML += dayHtml;
    }
}
function selectCalendarDate(dateStr, isActive) { const infoBox = document.getElementById('cal-selected-info'); if(isActive) { document.getElementById('cal-selected-date').innerText = formatDate(dateStr); document.getElementById('cal-view-workout-btn').onclick = () => { openMuscleMap(dateStr); }; infoBox.classList.remove('hidden'); infoBox.classList.add('flex'); } else { infoBox.classList.add('hidden'); infoBox.classList.remove('flex'); } }

function openMuscleMap(specificDate = null) { currentMapBaseDate = specificDate || document.getElementById('prog-date').value; if(!currentMapBaseDate) return; setMapRange(1); document.getElementById('muscle-modal').classList.remove('hidden'); document.getElementById('muscle-modal').classList.add('flex'); }
function closeMuscleMap() { document.getElementById('muscle-modal').classList.add('hidden'); document.getElementById('muscle-modal').classList.remove('flex'); }
function setMapRange(range) {
    currentMapRange = range;
    ['btn-range-1', 'btn-range-3', 'btn-range-7'].forEach(id => { const btn = document.getElementById(id); btn.classList.remove('bg-blue-600', 'text-white', 'shadow'); btn.classList.add('bg-slate-700', 'text-slate-300'); });
    const activeBtn = document.getElementById(`btn-range-${range}`); activeBtn.classList.remove('bg-slate-700', 'text-slate-300'); activeBtn.classList.add('bg-blue-600', 'text-white', 'shadow');
    renderMapWithRange();
}
function renderMapWithRange() {
    let s = {}; let exerciseListHtml = ''; let targetDates = [];
    let parts = currentMapBaseDate.split('-'); let baseD = new Date(parts[0], parts[1]-1, parts[2]);
    for(let i=0; i<currentMapRange; i++) { let d = new Date(baseD); d.setDate(d.getDate() - i); let y = d.getFullYear(); let m = String(d.getMonth() + 1).padStart(2, '0'); let day = String(d.getDate()).padStart(2, '0'); targetDates.push(`${y}-${m}-${day}`); }
    
    if(currentMapRange === 1) { document.getElementById('map-date-display').innerText = formatDate(targetDates[0]); }
    else { document.getElementById('map-date-display').innerText = `${formatDate(targetDates[targetDates.length-1])} ➔ ${formatDate(targetDates[0])}`; }

    let exercisesByDate = {}; targetDates.forEach(td => exercisesByDate[td] = []); let processedKeys = new Set();
    for(const [dk, d] of Object.entries(currentRoutine.days)){
        d.exercises.forEach(ex => {
            const hk = getHistKey(ex.name); if (processedKeys.has(hk)) return; processedKeys.add(hk);
            const l = JSON.parse(localStorage.getItem(hk)) || [];
            targetDates.forEach(td => {
                const todaysLogs = l.filter(h => h.date === td);
                if(todaysLogs.length > 0) {
                    exercisesByDate[td].push({ name: ex.name, logs: todaysLogs });
                    todaysLogs.forEach(log => { const st = parseInt(log.sets) || 0; if(st > 0 && ex.muscles){ for(const [m,sc] of Object.entries(ex.muscles)) s[m] = (s[m]||0) + (sc*st); } });
                }
            });
        });
    }
    
    exerciseDB.forEach(dbEx => {
        const hk = getHistKey(dbEx.name); if (processedKeys.has(hk)) return; const l = JSON.parse(localStorage.getItem(hk)) || [];
        targetDates.forEach(td => {
            const todaysLogs = l.filter(h => h.date === td && h.isSubstitute);
            if(todaysLogs.length > 0) {
                exercisesByDate[td].push({ name: dbEx.name + " (Sostitutivo)", logs: todaysLogs });
                todaysLogs.forEach(log => { const st = parseInt(log.sets) || 0; if(st > 0 && dbEx.muscles){ for(const [m,sc] of Object.entries(dbEx.muscles)) s[m] = (s[m]||0) + (sc*st); } });
            }
        });
    }
    );

    targetDates.forEach(td => {
        if(exercisesByDate[td].length > 0) {
            exerciseListHtml += `<div class="mt-4 mb-2 font-bold text-blue-400 text-sm border-b border-slate-700 pb-1 uppercase tracking-wider">${formatDate(td)}</div>`;
            exercisesByDate[td].forEach(item => {
                exerciseListHtml += `<div class="bg-slate-900 p-3 rounded-lg border border-slate-700/50 mb-2"><div class="font-bold text-slate-200 text-xs border-b border-slate-700 pb-1 mb-2">${item.name}</div>`;
                item.logs.forEach(log => { exerciseListHtml += `<div class="flex justify-between items-center text-xs text-slate-400 mt-1"><span class="bg-slate-800 px-2 py-0.5 rounded text-blue-300 font-medium">${log.sets} x ${log.reps}</span><span class="font-bold text-slate-300">${log.weight} Kg</span></div>`; });
                exerciseListHtml += `</div>`;
            });
        }
    });

    const listContainer = document.getElementById('map-exercise-list');
    if(exerciseListHtml === '') { listContainer.innerHTML = '<div class="text-xs text-slate-500 text-center italic py-2">Nessun allenamento in questo periodo.</div>'; }
    else { listContainer.innerHTML = exerciseListHtml; }

    let chestUpperScore = s['front-chest-upper']||0; let chestLowerScore = s['front-chest-lower']||0; let frontShoulderScore = s['front-shoulder']||0; let armsFrontScore = (s['front-biceps']||0) + (s['front-forearm']||0); let absScore = (s['front-abs']||0) + (s['front-abs-lower']||0) + (s['front-obliques']||0); let quadsScore = s['front-quads']||0; let adductorsScore = s['front-adductors']||0;
    let backScore = (s['back-traps']||0) + (s['back-lats']||0); let lowerBackScore = s['back-lowerback']||0; let rearShoulderScore = s['back-shoulder']||0; let armsRearScore = s['back-triceps']||0; let glutesScore = s['back-glutes']||0; let hamstringsScore = s['back-hamstrings']||0; let calvesScore = (s['front-calves']||0) + (s['back-calves']||0);
    
    const updateMaskGlow = (id, score) => {
        const layer = document.getElementById(id); if(!layer) return; const img = layer.querySelector('img');
        if(score === 0) { layer.style.opacity = '0'; }
        else { let color = score <= 4 ? '#facc15' : (score <= 9 ? '#f97316' : '#ef4444'); img.style.filter = `drop-shadow(1000px 0 0 ${color})`; layer.style.opacity = score <= 4 ? '0.6' : (score <= 9 ? '0.8' : '0.95'); }
    };

    updateMaskGlow('layer-chest-upper', chestUpperScore); updateMaskGlow('layer-chest-lower', chestLowerScore); updateMaskGlow('layer-shoulders-front', frontShoulderScore); updateMaskGlow('layer-arms-front', armsFrontScore); updateMaskGlow('layer-abs', absScore); updateMaskGlow('layer-quads', quadsScore); updateMaskGlow('layer-adductors', adductorsScore);
    updateMaskGlow('layer-back', backScore); updateMaskGlow('layer-lowerback', lowerBackScore); updateMaskGlow('layer-shoulders-rear', rearShoulderScore); updateMaskGlow('layer-arms-rear', armsRearScore); updateMaskGlow('layer-glutes', glutesScore); updateMaskGlow('layer-hamstrings', hamstringsScore); updateMaskGlow('layer-calves', calvesScore);
}
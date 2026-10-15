// Dane przewodnika. coords: [lat, lon]. sub: dodatkowe punkty przy danym przystanku.
const TRIP = { start: "2026-10-17", end: "2026-10-24" };

const DAYS = [
  { day: 1, dow: "Sob", dn: 17, title: "Przylot, zakupy i Funchal nocą", weather: "Słonecznie, 24°C · noc 21°C", items: [
    { id: "d1_1", time: "16:00", title: "Odbiór auta na lotnisku FNC", park: "Terminal FNC (Santa Cruz)", c: [32.6942, -16.7781], desc: "Nagraj filmik auta dookoła przy odbiorze (felgi, zderzaki). Wyjazd na drogę VR1 w kierunku Funchal." },
    { id: "d1_2", time: "16:45", title: "Zakupy w Canceli (Zjazd 14)", park: "Parking podziemny – bezpłatny", food: "Zaopatrzenie do apartamentu", c: [32.6517, -16.8584], desc: "Continente Modelo lub Pingo Doce Super Cancela tuż przy trasie VR1. Kup wodę na szlaki, owoce (marakuje, banany), sery i pieczywo." },
    { id: "d1_3", time: "17:45", title: "Zameldowanie: Beco de Santa Emília 15", park: "Rua de Santa Luzia (białe linie – 0 €)", c: [32.6552, -16.9061], base: true, desc: "Wypakowanie bagaży w Santa Luzia. Nie wjeżdżaj w sam wąski zaułek Beco – zaparkuj na sąsiedniej ulicy." },
    { id: "d1_4", time: "18:30", title: "Zachód słońca: Miradouro Pico dos Barcelos", park: "Zatoka pod punktem (bezpłatny)", c: [32.6591, -16.9298], desc: "10 min autem z apartamentu. Panorama 360° na amfiteatr Funchal i ocean o zachodzie słońca." },
    { id: "d1_5", time: "19:45", title: "Kolacja w Zona Velha (Rua de Santa Maria)", park: "Pieszo 15 min lub Parking Almirante Reis (1,50 €/h)", food: "Taberna Ruel / O Jango: bolo do caco, lapas, espada z bananem, poncha", c: [32.6476, -16.9008], desc: "Historyczna starówka ze sztuką uliczną na malowanych drzwiach kamienic z XV wieku." }
  ]},
  { day: 2, dow: "Niedz", dn: 18, title: "Szczyty, Santana i Makłowicz", weather: "Większość słońca, 22°C · w górach 8–12°C", items: [
    { id: "d2_1", time: "07:30", title: "Pico do Areeiro (1818 m) + Schody do Nieba (PR1)", park: "Parking górny (2–4 €/h) lub P2 dolny", trail: "PR1 do Pedra Rija · 2,4 km tam i z powrotem · 1,5 h · bilet SIMplifica 3 €", c: [32.7353, -16.9286], desc: "Dojazd WYŁĄCZNIE drogą ER103 przez Poiso! Przejście przez Orle Gniazdo (Ninho da Manta) i tunel (weź czołówkę!) na Schody do Nieba." },
    { id: "d2_2", time: "10:30", title: "Pico Ruivo (1862 m) – szlak PR1.2", park: "Parking Achada do Teixeira (bezpłatny)", trail: "PR1.2 · 5,6 km tam i z powrotem · 2–2,5 h · bilet SIMplifica 3 €", c: [32.7648, -16.9062], desc: "Najprostsza trasa na najwyższy szczyt Madery. Wygodna kamienna ścieżka i kosmiczna panorama ponad chmurami." },
    { id: "d2_3", time: "13:30", title: "Santana i Rocha do Navio", park: "Centrum Santany / Rocha do Navio (bezpłatny)", c: [32.8055, -16.8824], sub: [["Miradouro Rocha do Navio", 32.8097, -16.8722]], desc: "Krótki spacer przy trójkątnych chatkach krytych strzechą, a następnie punkt widokowy Rocha do Navio nad klifem." },
    { id: "d2_4", time: "15:00", title: "Obiad od Makłowicza: Quinta do Furão", park: "Bezpłatny parking przed restauracją", food: "Dorsz z grilla z puree z truflą i warzywami z patelni", c: [32.8142, -16.8794], desc: "Restauracja na klifie w Santanie z widokiem na ocean i góry. Warto zarezerwować stolik z wyprzedzeniem!" },
    { id: "d2_5", time: "17:00", title: "Miradouro do Guindaste (Faial)", park: "Bezpłatny parking przy kładkach", c: [32.7931, -16.8492], desc: "Dwie szklane kładki zawieszone nad czarnymi klifami i rozbijającymi się falami Atlantyku. Powrót do Funchal ok. 40 min (tunel Cortado i Machico)." }
  ]},
  { day: 3, dow: "Pon", dn: 19, title: "Funchal, Monte, Dolina Zakonnic, Câmara de Lobos", weather: "Pochmurno z przejaśnieniami, 22°C", items: [
    { id: "d3_1", time: "08:30", title: "Targ Mercado dos Lavradores i Katedra Sé", park: "Pieszo z apartamentu (auto zostaje pod domem)", food: "Owoce kupuj w Pingo Doce obok – na targu zdzierają", c: [32.6486, -16.9041], desc: "Płytki azulejos, kwiaty strelicji i poranna hala rybna z czarnymi pałaszami i tuńczykiem. Uważaj na stoiska z owocami na piętrze – po degustacji potrafią policzyć kilkadziesiąt euro." },
    { id: "d3_2", time: "10:00", title: "Teleférico do Monte i ogród Monte Palace", park: "Start w parku Almirante Reis", trail: "Kolejka 14,50 € · ogród 15 € · 2,5–3 h", c: [32.6465, -16.9016], desc: "Wjazd nad dachami Funchal, kościół z grobowcem Karola I Habsburga i ogromny ogród tropikalny Monte Palace." },
    { id: "d3_3", time: "13:00", title: "Zjazd wiklinowymi saniami (Monte Toboggan)", park: "Start pod kościołem w Monte", trail: "35 € za 2 os. (gotówka) · 2 km · do 48 km/h", c: [32.6756, -16.9026], desc: "Tradycja z 1850 r. Meta w Livramento jest 12 minut pieszo od apartamentu w Santa Luzia." },
    { id: "d3_4", time: "14:30", title: "Eira do Serrado i szlak do Doliny Zakonnic", park: "Bezpłatny parking Eira do Serrado / Miradouro Paredão", trail: "Zejście do Curral das Freiras · 2,5 km w dół · 45–60 min", c: [32.7097, -16.9647], desc: "Zejście dawną ścieżką zakonnic na dno krateru. Powrót pieszo albo autobusem nr 81 / taxi. Spróbuj zupy i likieru z kasztanów!" },
    { id: "d3_5", time: "18:00", title: "Port rybacki Câmara de Lobos i espetada", park: "Parking wielopoziomowy w centrum (ok. 1 €/h)", food: "Vila do Peixe (ryby) lub Santo António (espetada + milho frito)", c: [32.6475, -16.9749], desc: "Klimatyczna zatoka z kolorowymi łódkami rybackimi Xavelhas." }
  ]},
  { day: 4, dow: "Wt", dn: 20, title: "Zielona Północ: PR9, PR11 i Porto da Cruz", weather: "Większość słońca, 22°C", items: [
    { id: "d4_1", time: "08:00", title: "Queimadas i PR9 Levada do Caldeirão Verde", park: "Parking Queimadas – płatny ok. 3 €/dzień", trail: "PR9 · 13 km tam i z powrotem · 4–4,5 h · płasko · 4 tunele · SIMplifica 3 €", c: [32.7836, -16.9056], desc: "Najbardziej zielona lewada w lesie laurowym UNESCO ze 100-metrowym wodospadem. OBOWIĄZKOWA czołówka do tuneli i kurtka przeciwdeszczowa!" },
    { id: "d4_2", time: "13:45", title: "Ribeiro Frio i PR11 Vereda dos Balcões", park: "Bezpłatny wzdłuż drogi ER103", trail: "PR11 · 3 km tam i z powrotem · 45–60 min · płasko · SIMplifica 3 €", c: [32.7347, -16.8863], desc: "Łatwy spacer na balkon widokowy na najwyższe szczyty oraz spotkanie z ziębą maderską i zniczkiem maderskim." },
    { id: "d4_3", time: "15:15", title: "Miradouro da Portela i Porto da Cruz", park: "Bezpłatny przy plaży i destylarni", food: "A Pipa / Praça do Engenho: bife de atum lub ośmiornica", c: [32.7753, -16.8286], desc: "Panorama na Orlą Skałę (Penha d'Águia), obiad nad oceanem i wizyta w parowej destylarni rumu Engenhos do Norte (wstęp 0 €)." }
  ]},
  { day: 5, dow: "Śr", dn: 21, title: "Fanal, Porto Moniz i Seixal", weather: "Częściowe słońce, 22°C · w Fanal możliwa mgła, 12°C", items: [
    { id: "d5_1", time: "08:00", title: "Las wawrzynowy Fanal", park: "Bezpłatny parking Posto Florestal do Fanal", trail: "Spacer wśród drzew Til · 1–1,5 h · wstęp 0 €", c: [32.8087, -17.1415], desc: "Bądź przed 9:00 dla ciszy i klimatu bez autokarów. Weź kurtkę z membraną i używaj Mapy.cz we mgle." },
    { id: "d5_2", time: "10:00", title: "Kolejka Achadas da Cruz i Ponta da Ladeira", park: "Bezpłatny parking przy górnej stacji", trail: "Kolejka 5 € tam i z powrotem (gotówka) · przerwa 11:30–12:30!", c: [32.8384, -17.2094], sub: [["Miradouro da Ponta da Ladeira", 32.8421, -17.2115]], desc: "Zjazd kolejką o nachyleniu 98% pod sam klif i spacer nad oceanem (1,5–2 h). Obok punkt widokowy Ponta da Ladeira." },
    { id: "d5_3", time: "12:30", title: "Baseny wulkaniczne w Porto Moniz", park: "Niebieskie linie wzdłuż promenady (ok. 1 €/h)", food: "Orca / Sea View · wstęp na baseny 3 €", c: [32.8675, -17.1695], desc: "Kąpiel w naturalnych basenach lawowych (Piscinas Naturais) oraz darmowych basenach Cachalote przy skale." },
    { id: "d5_4", time: "15:00", title: "Ribeira da Janela", park: "Bezpłatny parking przy ujściu rzeki", c: [32.8465, -17.15], desc: "Przejście przez tunel w skale na kamienistą plażę z widokiem na formacje Ilhéus da Ribeira da Janela. Postój ok. 30 min." },
    { id: "d5_5", time: "15:45", title: "Seixal: czarna plaża i Espaço Infinito", park: "Bezpłatny przy zjeździe do portu", food: "Lemoniada (kierowca!) lub wino z widokiem", c: [32.8235, -17.1025], sub: [["Espaço Infinito", 32.8239, -17.1082]], desc: "Czarna plaża wulkaniczna pod zielonymi górami oraz relaks w ukrytym punkcie widokowym Espaço Infinito." },
    { id: "d5_6", time: "17:30", title: "Véu da Noiva, Água d'Alto i São Vicente", park: "Pobocze przy Start Point Cascata D'Alto da Água", c: [32.8098, -17.0598], desc: "Punkt widokowy Welon Panny Młodej, przejazd tunelem Água d'Alto (VE2), podejście pod wodospad i kapliczka na wzgórzu w São Vicente. Powrót tunelem do Funchal." }
  ]},
  { day: 6, dow: "Czw", dn: 22, title: "Rabaçal i dziki zachód", weather: "Większość słońca, 22°C", items: [
    { id: "d6_1", time: "08:00", title: "Rabaçal: PR6 25 Fontes + Risco lub Lagoa do Vento", park: "Bezpłatny parking Rabaçal przy ER105", trail: "PR6+PR6.1 · 11 km (7 km z busem za 5 €) · SIMplifica 3 € — albo Levada do Alecrim → Lagoa do Vento · 6,5 km", c: [32.7538, -17.1337], desc: "Przyjedź na 8:00! Klasyk 25 Źródeł + wodospad Risco albo mniej uczęszczany szlak PR6.3 pod 80-metrowy wodospad Lagoa do Vento (woda lodowata, widoki spektakularne)." },
    { id: "d6_2", time: "13:00", title: "Garganta Funda, latarnia Ponta do Pargo, Boa Morte", park: "Bezpłatne parkingi przy wszystkich punktach", c: [32.8136, -17.2631], sub: [["Wodospad Garganta Funda", 32.8184, -17.2592], ["Miradouro da Boa Morte", 32.7797, -17.2392]], desc: "Wodospad Garganta Funda, latarnia na 300-metrowym klifie w Ponta do Pargo i panorama z Miradouro da Boa Morte." },
    { id: "d6_3", time: "14:45", title: "Jardim do Mar i Calheta", park: "Jardim do Mar (0 €) · Calheta przy plaży (ok. 1,50 €/h)", food: "Obiad w Calhecie: Onda D'Água / Rocha Mar", c: [32.7381, -17.2114], sub: [["Plaża w Calhecie", 32.7192, -17.1753]], desc: "Spacer wąskimi uliczkami Jardim do Mar i odpoczynek przy złotej plaży w Calhecie." },
    { id: "d6_4", time: "17:00", title: "Farma bananów i zachód słońca w Ponta do Sol", park: "Madalena do Mar (0 €) · Ponta do Sol przy tunelu", food: "Kawa / kolacja na molo w Ponta do Sol", c: [32.6908, -17.1336], desc: "20-minutowa ścieżka wśród bananowców (Rota da Banana). Wodospad Aniołów tylko z daleka – stara droga pod nim jest zamknięta z powodu obrywów skał. Zachód słońca na molo w Ponta do Sol." }
  ]},
  { day: 7, dow: "Pt", dn: 23, title: "Klify południa i wino", weather: "Częściowe słońce, 22°C", items: [
    { id: "d7_1", time: "08:30", title: "Cabo Girão (580 m) – szklany taras", park: "Bezpłatny parking przed wejściem", trail: "Wstęp 2 € / os. · otwarte od 8:30", c: [32.6567, -17.0044], desc: "Jeden z najwyższych klifów morskich Europy. Rano przed 9:00 wejdziesz na szklaną podłogę bez kolejek." },
    { id: "d7_2", time: "09:30", title: "Ukryta zatoka Calhau da Lapa", park: "Bezpłatny na górze w Campanário", trail: "Zejście po schodach obok wodospadu · 25 min w dół · 0 €", c: [32.6653, -17.0289], desc: "Domki rybaków wykute w skale i krystalicznie czysta woda do kąpieli. Weź strój kąpielowy i buty do wody!" },
    { id: "d7_3", time: "11:30", title: "Kolejka do Fajã dos Padres", park: "Bezpłatny przy górnej stacji w Quinta Grande", food: "Obiad nad oceanem: tuńczyk, awokado, pudim de maracujá · kolejka 12 €", c: [32.6594, -17.0239], desc: "Zjazd 300 m w dół klifu do ogrodu pełnego mango, awokado, papai i winnic Malvasia." },
    { id: "d7_4", time: "14:30", title: "Funchal: Blandy's, D'Oliveira, CR7 lub rejs na delfiny", park: "Zostaw auto pod apartamentem!", food: "Degustacja 4 szczepów Madery + kolacja pożegnalna (pudim de maracujá, bolo de mel)", c: [32.6476, -16.9114], desc: "Opcja A: rejs katamaranem z mariny na delfiny i wieloryby (2,5–3 h). Opcja B: degustacja w Blandy's Wine Lodge (od 1811 r.) i Pereira D'Oliveira + Muzeum CR7 (wstęp 5 €)." }
  ]},
  { day: 8, dow: "Sob", dn: 24, title: "Półwysep św. Wawrzyńca i wylot", weather: "Większość słońca, 22°C · zwrot auta 16:00", items: [
    { id: "d8_1", time: "08:40", title: "Ponta do Rosto i Ponta do Bode", park: "Bezpłatny parking przy Ponta do Rosto", c: [32.7483, -16.7072], desc: "Wykwaterowanie o 8:00. Panorama na czerwono-czarne klify północnego i południowego wybrzeża." },
    { id: "d8_2", time: "09:30", title: "PR8 Półwysep św. Wawrzyńca", park: "Bezpłatny parking przy rondzie Baía d'Abra", trail: "PR8 · 6 km tam i z powrotem · 3–3,5 h · SIMplifica 3 €", c: [32.7432, -16.7011], desc: "Trzy zasady: krem SPF 50 i czapka (zero cienia), buty z przyczepnością (wiatr i żwir) oraz kąpiel przy molo koło Casa do Sardinha." },
    { id: "d8_3", time: "13:15", title: "Pico do Facho i plaża w Machico", park: "Pico do Facho (0 €) · Machico przy plaży (1 €/h)", food: "Obiad w Machico: O Galã / Mercado Velho", c: [32.7167, -16.765], sub: [["Pico do Facho", 32.7228, -16.7592]], desc: "Widok na pas startowy z Pico do Facho, piaszczysta plaża Praia da Banda d'Além z prysznicami i przebieralniami – odśwież się przed lotem (5 min od lotniska)." },
    { id: "d8_4", time: "15:30", title: "Tankowanie i zwrot auta na FNC o 16:00", park: "Stacja Repsol przy lotnisku → zwrot Car Rental FNC", c: [32.6942, -16.7781], desc: "Zatankuj do pełna tuż przed zjazdem na lotnisko, zachowaj paragon." }
  ]}
];

const FOOD = [
  "Bolo do caco – ciepły chlebek z masłem czosnkowym",
  "Lapas grelhadas – grillowane skałoczepy z cytryną",
  "Peixe espada com banana – czarny pałasz z bananem i marakują",
  "Dorsz z grilla z puree z truflą (Quinta do Furão)",
  "Espetada – szaszłyk wołowy na patyku laurowym + milho frito",
  "Bife de atum – stek ze świeżego tuńczyka",
  "Zupa kasztanowa / likier kasztanowy (Dolina Zakonnic)",
  "Poncha – tradycyjna, Pescador lub Maracujá",
  "Wino Madera: Sercial, Verdelho, Boal, Malvasia",
  "Desery: pudim de maracujá, queijadas, bolo de mel, pastel de nata"
];

const WINE = [
  ["Sercial", "wytrawne, 12°C", "aperitif, ryby, bolo do caco"],
  ["Verdelho", "półwytrawne", "zupy, pasztety, przystawki"],
  ["Boal", "półsłodkie", "sery pleśniowe, bakalie"],
  ["Malvasia", "słodkie, 16°C", "desery, kawa, pastel de nata"]
];

const PREP = [
  "Offline: pobierz mapę Madery w Apple Maps (Mapy → profil → Mapy offline) i w Mapy.cz",
  "Bilety SIMplifica: PR1, PR1.2, PR9, PR11, PR6, PR8 – zrzuty ekranu z kodem QR",
  "Rezerwacja stolika: Quinta do Furão, niedziela 18.10, ok. 15:00",
  "Czołówka (tunele na PR9 i PR1)",
  "Kurtka przeciwdeszczowa / przeciwwiatrowa (Fanal, szczyty)",
  "Krem SPF 50 i czapka (PR8, PR1)",
  "Buty trekkingowe z dobrą przyczepnością + zapasowe skarpetki",
  "Strój kąpielowy, ręcznik szybkoschnący, buty do wody",
  "Gotówka i bilon: 60–80 € (sanie, kolejki, parkomaty)",
  "Powerbank i kabel do auta"
];

// Sekcje wiedzy (zaufana treść, dopuszcza <b>)
const GUIDE = [
  { t: "Pogoda i strategia", open: true, p: [
    "Prognoza: <b>sob 17.10</b> słonecznie 24°C. Od 18 do 24.10 ok. 22°C w dzień i 19°C w nocy, zmienne zachmurzenie, deszcz 15–30%, wiatr 4–11 mph z północy / północnego wschodu. Najbardziej pochmurny: poniedziałek 19.10.",
    "Pogoda zmienia się diametralnie między dolinami i wysokościami. Rano sprawdź kamery na <b>netmadeira.com</b> i chmury na <b>Windy.com</b>.",
    "Plan jest modułowy: czyste szczyty → jedź w góry (dzień 2). Chmury w górach → zamień dni i jedź na wybrzeże albo do mglistego Fanal.",
    "<b>Szlaki PR</b> (PR1, PR1.2, PR6, PR8, PR9, PR11) są płatne i wymagają rezerwacji dnia i godziny na <b>simplifica.madeira.gov.pt</b>. Miej bilety z kodem QR w telefonie przed wejściem na szlak."
  ]},
  { t: "Baza i zakupy", p: [
    "<b>Apartament:</b> Beco de Santa Emília 15, Santa Luzia, 9050-445 Funchal. Ok. 15 min pieszo w dół do Starego Miasta, szybki wyjazd na VR1.",
    "<b>Parkowanie:</b> Beco to wąski zaułek. Parkuj na szerszej Rua de Santa Luzia lub Rua Nova do Pina (białe linie, bez tabliczki Moradores).",
    "<b>Duże zakupy po przylocie:</b> zjazd 14 (Cancela) z VR1 w Caniço, ok. 10 min od lotniska. Obok siebie Continente Modelo (32.6517, −16.8584) i Pingo Doce Super (32.6508, −16.8596), darmowe parkingi podziemne, czynne do 21–22.",
    "<b>Na co dzień:</b> Pingo Doce w Anadia obok Mercado dos Lavradores (parking, ciepłe dania na wagę), Pingo Doce w La Vie, Continente w Plaza Madeira (5–7 min autem). Rano piekarnie przy Rua de Santa Luzia i Rua do Comboio: bolo do caco, pastel de nata.",
    "<b>Uwaga na targu:</b> sprzedawcy częstują marakują, a potem liczą kilkadziesiąt euro za kilka owoców. Te same kupisz kilkukrotnie taniej w Pingo Doce lub Continente."
  ]},
  { t: "Jazda po Maderze", p: [
    "<b>Zjazdy 20–30%:</b> nie jedź na samym hamulcu. W automacie włącz tryb manualny (M, +/−) albo L/B / bieg 2 lub 1 i hamuj silnikiem.",
    "<b>VR1:</b> bardzo krótkie pasy włączania, często ze znakiem STOP. Nie wjeżdżaj z rozpędu, poczekaj na lukę. Przed węzłami zjeżdżaj na lewy pas, by wpuścić innych.",
    "<b>Ronda:</b> prawy pas wyłącznie do 1. zjazdu. Prosto, w lewo lub zawracanie – pas wewnętrzny, na zewnętrzny z kierunkowskazem po minięciu zjazdu przed Twoim.",
    "<b>Google Maps</b> lubi „skróty” wąskimi uliczkami (Caminho / Beco) o nachyleniu 30%. Trzymaj się VR, VE i dróg ER (ER101, ER103, ER105, ER110).",
    "<b>Pico do Areeiro:</b> zawsze ER103 przez Poiso. Nigdy stromo przez Trapiche i Barreira.",
    "<b>Linie parkingowe:</b> niebieskie – płatne (parkomat, miej bilon), białe – bezpłatne (o ile nie Moradores), żółte – zakaz. Przy szlakach nie parkuj poza liniami – mandaty i holowanie. Na pochyłości skręć koła w stronę krawężnika i zaciągnij ręczny.",
    "<b>Paliwo:</b> nie jedź w góry ani na północ z rezerwą. Na płaskowyżu nie ma stacji."
  ]}
];

const LINKS = [
  ["Bilety na szlaki PR", "https://simplifica.madeira.gov.pt"],
  ["Status szlaków IFCN", "https://ifcn.madeira.gov.pt"],
  ["Kamery na żywo", "https://netmadeira.com/webcams-madeira"],
  ["Windy – chmury i wiatr", "https://www.windy.com"]
];

async function loadDictionary() {
  const bar = document.getElementById("load-bar");
  const msg = document.getElementById("load-msg");
  try {
    msg.textContent = "Connexion au dictionnaire ODS…";
    bar.style.width = "10%";
    const resp = await fetch(DICT_URL);
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    bar.style.width = "40%";
    msg.textContent = "Téléchargement en cours…";
    const text = await resp.text();
    bar.style.width = "70%";
    msg.textContent = "Construction du dictionnaire…";
    const lines = text.split("\n");
    for (const line of lines) {
      const w = line.trim();
      if (!w) continue;
      const clean = deaccent(w).replace(/[^A-Z]/g, "");
      if (clean.length >= 5 && clean.length <= 15) DICT.add(clean);
    }
    // Mots W complets ODS9 (554 mots, 5-15 lettres)
    const W_WORDS_ODS9 = [
      "ADAMAWA","ADAMAWAS","ALAWITE","ALAWITES","ARAWAK","ARAWAKS","AWACS","AWALE","AWALES","AWELE",
      "AWELES","BIWAS","BOWAL","BOWALS","BOWETTE","BOWETTES","BOWLING","BOWLINGS","BROWNIE","BROWNIEN",
      "BROWNIES","BROWNING","BUNGALOW","CAKEWALK","CASHFLOW","CAWCHER","CAWCHERE","CAWCHERS","CHAWARMA","CHIPPEWA",
      "CHOWCHOW","CLOWN","CLOWNS","COLESLAW","COWBOY","COWBOYS","COWGIRL","COWGIRLS","COWPER","COWPERS",
      "COWPOX","CRAWL","CRAWLA","CRAWLAI","CRAWLAIS","CRAWLAIT","CRAWLANT","CRAWLAS","CRAWLAT","CRAWLE",
      "CRAWLEE","CRAWLEES","CRAWLENT","CRAWLER","CRAWLERA","CRAWLES","CRAWLEUR","CRAWLEZ","CRAWLIEZ","CRAWLONS",
      "CRAWLS","CROWN","CROWNS","CROWS","DARKWEB","DARKWEBS","DAUWS","DEWAR","DEWARS","DEWATTE",
      "DEWATTEE","DEWATTES","DIWAN","DIWANS","DRAWBACK","EWEES","FAIRWAY","FAIRWAYS","FATWA","FATWAS",
      "FIREWALL","FIREWIRE","FLOWS","FOLLOWER","FORWARDA","FORWARDE","FREEWARE","GAGWOMAN","GAGWOMEN","GEWURZ",
      "GIGAWATT","GNAWA","GNAWAS","GOODWILL","GROWLER","GROWLERS","GURDWARA","GWERZ","GWOKA","GWOKAS",
      "HARDWARE","HAWAIEN","HAWAIENS","HAWAIIEN","IWANS","KAKAWI","KAKAWIS","KAWAI","KAWAII","KAWAIIS",
      "KAWAIS","KAWAS","KAWIS","KIKIWI","KIKIWIS","KILOWATT","KIWIS","KOWEITI","KOWEITIE","KOWEITIS",
      "KWACHA","KWACHAS","KWANZA","KWANZAS","LANDWEHR","LAWSONIA","LUDWIGIA","MALAWIEN","MALAWITE","MALWARE",
      "MALWARES","MAXWELL","MAXWELLS","MEGAWATT","MOHAWK","MOHAWKS","MOONWALK","NETWORK","NETWORKS","NEWLOOKS",
      "NEWTON","NEWTONS","OJIBWA","OJIBWAS","OJIBWAY","OJIBWAYS","OUTLAW","OUTLAWS","PAWNEE","PAWNEES",
      "PEEPSHOW","PETAWATT","PILAW","PILAWS","QAWWALI","QAWWALIS","QWERTY","QWERTZ","RAWETTE","RAWETTES",
      "REDOWA","REDOWAS","RETWEET","RETWEETA","RETWEETE","RETWEETS","RETWITTA","RETWITTE","REWRITA","REWRITAI",
      "REWRITAS","REWRITAT","REWRITE","REWRITEE","REWRITER","REWRITES","REWRITEZ","RICKSHAW","ROWING","ROWINGS",
      "RWANDAIS","SALCHOW","SALCHOWS","SANDOW","SANDOWS","SANDWICH","SCHWA","SCHWAS","SHAWARMA","SHAWNEE",
      "SHAWNEES","SHOWBIZ","SHOWCASE","SHOWMAN","SHOWMANS","SHOWMEN","SHOWROOM","SHOWS","SLOWS","SNOWBOOT",
      "SNOWPARK","SOFTWARE","SPEEDWAY","SPYWARE","SPYWARES","SQUAW","SQUAWS","STAWUG","STAWUGS","STEWARD",
      "STEWARDS","SWAGS","SWAHELI","SWAHELIE","SWAHELIS","SWAHILI","SWAHILIE","SWAHILIS","SWAPPA","SWAPPAI",
      "SWAPPAIS","SWAPPAIT","SWAPPANT","SWAPPAS","SWAPPAT","SWAPPE","SWAPPEE","SWAPPEES","SWAPPENT","SWAPPER",
      "SWAPPERA","SWAPPES","SWAPPEZ","SWAPPIEZ","SWAPPONS","SWAPS","SWASTIKA","SWATI","SWATIS","SWATTING",
      "SWAZI","SWAZIE","SWAZIES","SWAZIS","SWEAT","SWEATER","SWEATERS","SWEATEUR","SWEATS","SWIFTIEN",
      "SWING","SWINGANT","SWINGS","SWINGUA","SWINGUAI","SWINGUAS","SWINGUAT","SWINGUE","SWINGUER","SWINGUES",
      "SWINGUEZ","SWINS","SWITCH","SWITCHA","SWITCHAI","SWITCHAS","SWITCHAT","SWITCHE","SWITCHEE","SWITCHER",
      "SWITCHES","SWITCHEZ","SWITCHS","TALKSHOW","TALWEG","TALWEGS","TAXIWAY","TAXIWAYS","TERAWATT","THALWEG",
      "THALWEGS","TOMAHAWK","TOMAWAK","TOMAWAKS","TOWNSHIP","TRAMWAY","TRAMWAYS","TSWANA","TSWANAS","TWEED",
      "TWEEDS","TWEEN","TWEENS","TWEET","TWEETA","TWEETAI","TWEETAIS","TWEETAIT","TWEETANT","TWEETAS",
      "TWEETAT","TWEETE","TWEETEE","TWEETEES","TWEETENT","TWEETER","TWEETERA","TWEETERS","TWEETES","TWEETEUR",
      "TWEETEZ","TWEETIEZ","TWEETONS","TWEETS","TWERK","TWERKS","TWILL","TWILLS","TWINS","TWINSET",
      "TWINSETS","TWIRLING","TWIST","TWISTA","TWISTAI","TWISTAIS","TWISTAIT","TWISTANT","TWISTAS","TWISTAT",
      "TWISTE","TWISTEE","TWISTEES","TWISTER","TWISTERA","TWISTERS","TWISTES","TWISTEUR","TWISTEZ","TWISTIEZ",
      "TWISTONS","TWISTS","TWITTA","TWITTAI","TWITTAIS","TWITTAIT","TWITTANT","TWITTAS","TWITTAT","TWITTE",
      "TWITTEE","TWITTEES","TWITTENT","TWITTER","TWITTERA","TWITTES","TWITTEUR","TWITTEZ","TWITTIEZ","TWITTONS",
      "WACAPOU","WACAPOUS","WADERS","WADING","WADINGS","WAGAGE","WAGAGES","WAGON","WAGONNEE","WAGONNET",
      "WAGONS","WAKAME","WAKAMES","WALES","WALIS","WALKMAN","WALKMANS","WALKOVER","WALKYRIE","WALLABY",
      "WALLABYS","WALLACE","WALLACES","WALLON","WALLONNE","WALLONS","WAMPUM","WAMPUMS","WAOUH","WAPITI",
      "WAPITIS","WAQFS","WARGAME","WARGAMES","WARNING","WARNINGS","WARRANT","WARRANTA","WARRANTE","WARRANTS",
      "WASABI","WASABIS","WASPS","WATER","WATERS","WATERZOI","WATTE","WATTEE","WATTEES","WATTES",
      "WATTMAN","WATTMANS","WATTMEN","WATTS","WAVRIEN","WAVRIENS","WAYANG","WAYANGS","WEBCAM","WEBCAMS",
      "WEBDOC","WEBDOCS","WEBER","WEBERS","WEBLOG","WEBLOGS","WEBRADIO","WEBSERIE","WEBTELE","WEBTELES",
      "WEBZINE","WEBZINES","WEDGE","WEDGES","WEEKEND","WEEKENDS","WEHNELT","WEHNELTS","WEIGELIA","WELCHE",
      "WELCHES","WELSCHE","WELSCHES","WELSH","WELSHS","WELTER","WELTERS","WENDAT","WENDATE","WENDATES",
      "WENDATS","WENGE","WENGES","WENZE","WENZES","WERGELD","WERGELDS","WESLEYEN","WESTERN","WESTERNS",
      "WESTIE","WESTIES","WHARF","WHARFS","WHEELING","WHIGS","WHIPCORD","WHIPPET","WHIPPETS","WHIPS",
      "WHISKEY","WHISKEYS","WHISKIES","WHISKY","WHISKYS","WHIST","WHISTS","WIDGET","WIDGETS","WIDIA",
      "WIDIAS","WIENERLI","WIFIS","WIGWAM","WIGWAMS","WIKIS","WILAYA","WILAYAS","WILDIEN","WILDIENS",
      "WILLAYA","WILLAYAS","WILLIAMS","WIMAX","WINCH","WINCHES","WINCHEUR","WINCHS","WINDSURF","WINGLET",
      "WINGLETS","WINGSUIT","WINSTUB","WINSTUBS","WISHBONE","WISIGOTH","WISKI","WISKIS","WITLOOF","WITLOOFS",
      "WOKES","WOKISME","WOKISMES","WOLFRAM","WOLFRAMS","WOLOF","WOLOFS","WOMBAT","WOMBATS","WOOFER",
      "WOOFERS","WOOFEUR","WOOFEURS","WOOLMARK","WORKSHOP","WORMIEN","WORMIENS","WRAPS","WURMIEN","WURMIENS",
      "WURMS","WUSHU","WUSHUS","YAWLS","ZAWIYA","ZAWIYAS","ZUGZWANG","ZWANZA","ZWANZAI","ZWANZAIS",
      "ZWANZAIT","ZWANZANT","ZWANZAS","ZWANZAT","ZWANZE","ZWANZENT","ZWANZER","ZWANZERA","ZWANZES","ZWANZEUR",
      "ZWANZEZ","ZWANZIEZ","ZWANZONS","ZWIEBACK",
    ];
    W_WORDS_ODS9.forEach(w => DICT.add(w));

    // Mots K complets ODS9 (1357 mots, 5-15 lettres)
    const K_WORDS_ODS9 = [
      "ABKHAZE","AIKIDO","AIKIDOS","AKANS","AKASSA","AKASSAS","AKENE","AKENES","AKITA","AKITAS",
      "AKUAVIT","AKVAVIT","ALKYLE","ALKYLES","ALLOKO","ALLOKOS","ALOKO","ALOKOS","AMOKS","ANKHS",
      "ANORAKS","ARACK","ARAKS","ARAWAK","ARAWAKS","ARKOSE","ARKOSES","ASKARI","ASKARIS",
      "ATIEKE","ATIEKES","ATTIEKE","AZUKI","AZUKIS","BABOUK","BABOUKS","BACHKIR","BAKEOFE","BAKLAVA",
      "BAKUFU","BAKUFUS","BARAKA","BARAKAS","BARAKI","BARAKIE","BARAKIS","BASKET","BASKETS","BATIKS",
      "BAZOOKA","BEKEES","BEKES","BEURK","BEYLIK","BEYLIKS","BHAKTI","BHAKTIS",
      "BIKER","BIKERS","BIKEUR","BIKEUSE","BIKINI","BIKINIS","BLACKS","BLOCKS",
      "BOCKS","BOKIT","BOKITS","BOOKS","BOSKOOP","BOUKHA","BOUKHAS","BOUREK","BOUREKS","BREAKA",
      "BREAKAI","BREAKAS","BREAKAT","BREAKE","BREAKEE","BREAKER","BREAKES","BREAKEZ","BREAKS",
      "BRICKS","BRIKS","BRISKA","BRISKAS","BROKER","BROKERS","BROKEUR","BROOK","BROOKS","BUGAKU",
      "BUGAKUS","BUNKER","BUNKERS","BUNRAKU","BURKA","BURKAS","BURKINI","BUZUKI","BUZUKIS","CAKES",
      "CAKILE","CAKILES","CAKTA","CAKTAS","CAKTI","CAKTIS","CARRICK","CHAKRA","CHAKRAS","CHAPKA",
      "CHAPKAS","CHAPSKA","CHEBEKS","CHECK","CHECKAI","CHECKAS","CHECKAT","CHECKE","CHECKEE",
      "CHECKER","CHECKES","CHECKEZ","CHECKS","CHECKUP","CHEIK","CHEIKH","CHEIKHS","CHEIKS","CHIBOUK",
      "CHINOOK","CHOKE","CHOKES","CLARK","CLARKIA","CLARKS","CLICK","CLICKS","CLINKER","COCKER",
      "COCKERS","COCKNEY","COCKPIT","COKAGE","COKAGES","COKEFIA","COKEFIE","COKERIE","COKES","COKEUR",
      "COKEURS","COKING","COKINGS","COKOTA","COKOTAI","COKOTAS","COKOTAT","COKOTE","COKOTER","COKOTES",
      "COKOTEZ","COOKIE","COOKIES","CRACK","CRACKER","CRACKS","CREEKS","CRICKET",
      "CUPCAKE","DAIKIRI","DAIKON","DAIKONS","DAKINS","DAKOTA","DAKOTAS","DARKNET","DARKWEB","DAYAK",
      "DAYAKS","DEBREAK","DECKS","DESKS","DHIKR","DHIKRS","DIKTAT","DIKTATS","DINKA",
      "DINKAS","DOBOK","DOBOKS","DOCKER","DOCKERS","DOCKS","DRAKKAR","DRINK","DRINKS","DUNKA",
      "DUNKAI","DUNKAIS","DUNKAIT","DUNKANT","DUNKAS","DUNKAT","DUNKE","DUNKENT","DUNKER","DUNKERA",
      "DUNKES","DUNKEZ","DUNKIEZ","DUNKONS","DUNKS","DYKES","ENKYSTA","ENKYSTE","ESKER","ESKERS",
      "ESKIMO","ESKIMOS","ESKUARA","EUREKA","EUSKARA","EUSKERA","FAKES","FAKIR","FAKIRS","FLANKER",
      "FOLKEUX","FOLKLO","FOLKLOS","FOLKS","FONDOUK","FRAKE","FRAKES","FREAK","FREAKS","FRISKO",
      "FRISKOS","FRITKOT","FUNKS","FUNKY","FUNKYS","GAGAKU","GAGAKUS","GECKO","GECKOS","GEEKA",
      "GEEKAI","GEEKAIS","GEEKAIT","GEEKANT","GEEKAS","GEEKAT","GEEKE","GEEKENT","GEEKER","GEEKERA",
      "GEEKES","GEEKEZ","GEEKIEZ","GEEKONS","GEEKS","GINKGO","GINKGOS","GONAKIE","GOPAK",
      "GOPAKS","GWOKA","GWOKAS","HACKA","HACKAI","HACKAIS","HACKAIT","HACKANT","HACKAS","HACKAT",
      "HACKE","HACKEE","HACKEES","HACKENT","HACKER","HACKERA","HACKERS","HACKES","HACKEUR","HACKEZ",
      "HACKIEZ","HACKING","HACKLE","HACKLES","HACKONS","HADDOK","HAIDOUK","HAIKAI","HAIKAIS",
      "HAIKS","HAIKU","HAIKUS","HAKARL","HAKARLS","HAKAS","HAKKA","HAKKAS","HALAKHA","HARKA",
      "HARKAS","HARKI","HARKIE","HARKIES","HARKIS","HELISKI","HICKORY","HOCKEY","HOCKEYS","HOKIS",
      "HOPAK","HOPAKS","HOUKA","HOUKAS","HUSKIES","HUSKY","HUSKYS","IAKOUTE","IKATS","IKEBANA",
      "INUKS","INUKSUK","IRAKIEN","IROKO","IROKOS","JACKET","JACKETS","JACKPOT","JACKS","JATAKA",
      "JATAKAS","JERKA","JERKAI","JERKAIS","JERKAIT","JERKANT","JERKAS","JERKAT","JERKE","JERKENT",
      "JERKER","JERKERA","JERKES","JERKEUR","JERKEZ","JERKIEZ","JERKONS","JERKS","JOCKEY","JOCKEYS",
      "JOCKO","JOCKOS","JOKARI","JOKARIS","JOKER","JOKERS","JUDOKA","JUDOKAS","JUKEBOX","JUNKER",
      "JUNKERS","JUNKIE","JUNKIES","JUNKS","JUNKY","JUNKYS","KABARDE","KABARY","KABARYS","KABBALE",
      "KABIC","KABICS","KABIG","KABIGS","KABIYE","KABIYES","KABOULI","KABUKI","KABUKIS","KABYE",
      "KABYES","KABYLE","KABYLES","KACHA","KACHAS","KACHE","KACHES","KADAIF","KADAIFS","KADDISH",
      "KADIS","KADJAR","KADJARE","KADJARS","KAFIR","KAFIRS","KAGOU","KAGOUS","KAINITE","KAISER",
      "KAISERS","KAKAPO","KAKAPOS","KAKAWI","KAKAWIS","KAKIS","KALACH","KALACHS","KALES","KALIS",
      "KALIUM","KALIUMS","KALMIA","KALMIAS","KALMOUK","KAMALA","KAMALAS","KAMICHI","KAMIS","KANAK",
      "KANAKE","KANAKES","KANAKS","KANAS","KANAT","KANATS","KANDJAR","KANGLAR","KANJI","KANJIS",
      "KANNARA","KANOUN","KANOUNS","KANTIEN","KAOLIN","KAOLINS","KAONS","KAPOK","KAPOKS","KAPOS",
      "KAPPA","KAPPAS","KARAITE","KARAKUL","KARAOKE","KARATE","KARATES","KARBAU","KARBAUS","KARBAUX",
      "KARCHER","KAREN","KARENS","KARITE","KARITES","KARKADE","KARMA","KARMAN","KARMANS","KARMAS",
      "KAROSHI","KARST","KARSTS","KARTING","KARTS","KASAIEN","KASCHER","KASHER","KASHERE","KASHERS",
      "KASSITE","KATAL","KATALS","KATANA","KATANAS","KATAS","KATHAK","KATHAKS","KAVAS","KAWAI",
      "KAWAII","KAWAIIS","KAWAIS","KAWAS","KAWIS","KAYAC","KAYACS","KAYAK","KAYAKS","KAZAKH",
      "KAZAKHE","KAZAKHS","KEBAB","KEBABS","KEFFIEH","KEFIE","KEFIES","KEFIR","KEFIRS","KEFTA",
      "KEFTAS","KEIRIN","KEIRINS","KEKES","KELPS","KELVIN","KELVINS","KEMIA","KEMIAS","KENAF",
      "KENAFS","KENAS","KENDO","KENDOKA","KENDOS","KENTIA","KENTIAS","KENYAN","KENYANE","KENYANS",
      "KEPHIR","KEPHIRS","KEPHYR","KEPHYRS","KEPIS","KERABAU","KERMA","KERMAS","KERMES","KERNS",
      "KERRIA","KERRIAS","KERRIE","KERRIES","KETCH","KETCHS","KETCHUP","KETJE","KETJES","KETMIE",
      "KETMIES","KEUFS","KEUMS","KEVLAR","KEVLARS","KHAGNE","KHAGNES","KHALIFE","KHALKHA","KHAMMES",
      "KHAMSIN","KHANAT","KHANATS","KHANS","KHARIJI","KHATS","KHEDIVE","KHMER","KHMERE","KHMERES",
      "KHMERS","KHOBZ","KHOIN","KHOINS","KHOISAN","KHOLS","KIBITZ","KIBITZA","KIBITZE","KICKER",
      "KICKERS","KICKS","KIEFS","KIEVIEN","KIFAI","KIFAIS","KIFAIT","KIFAMES","KIFANT","KIFAS",
      "KIFASSE","KIFAT","KIFATES","KIFEE","KIFEES","KIFENT","KIFER","KIFERA","KIFERAI","KIFERAS",
      "KIFEREZ","KIFES","KIFEZ","KIFFA","KIFFAI","KIFFAIS","KIFFAIT","KIFFANT","KIFFAS","KIFFAT",
      "KIFFE","KIFFEE","KIFFEES","KIFFENT","KIFFER","KIFFERA","KIFFES","KIFFEZ","KIFFIEZ","KIFFONS",
      "KIFFS","KIFIEZ","KIFIONS","KIFKIF","KIFKIFS","KIFONS","KIKIS","KIKIWI","KIKIWIS","KIKONGO",
      "KILIM","KILIMS","KILOBIT","KILOHM","KILOHMS","KILOS","KILOVAR","KILTS","KIMBAP","KIMBAPS",
      "KIMCHI","KIMCHIS","KIMONO","KIMONOS","KINAS","KINASE","KINASES","KINBALL","KINES","KINESIE",
      "KININE","KININES","KINOIS","KINOISE","KIOSQUE","KIPPA","KIPPAS","KIPPER","KIPPERS","KIPPOUR",
      "KIRGHIZ","KIRPAN","KIRPANS","KIRSCH","KIRSCHS","KIRUNDI","KITCH","KITCHS","KITES","KITSCH",
      "KITSCHS","KIVAS","KIWIS","KIZOMBA","KLAFT","KLAFTS","KLAXON","KLAXONS","KLEENEX","KLEPHTE",
      "KLEZMER","KLIPPE","KLIPPES","KLOUKA","KLOUKAI","KLOUKAS","KLOUKAT","KLOUKE","KLOUKEE","KLOUKER",
      "KLOUKES","KLOUKEZ","KNACK","KNACKS","KNAUTIE","KNEPFLE","KNESSET","KNICKER","KNODEL","KNODELS",
      "KNOUT","KNOUTS","KOALA","KOALAS","KOANS","KOBOLD","KOBOLDS","KOCHIA","KOCHIAS","KODAK",
      "KODAKS","KODIAK","KODIAKS","KODKOD","KODKODS","KOHEUL","KOHEULS","KOHOL","KOHOLS","KOINE",
      "KOINES","KOKAS","KOLAS","KOLKHOZ","KOMBU","KOMBUS","KONDO","KONDOS","KONGO","KONGOS",
      "KONJAC","KONJACS","KONKANI","KONZERN","KOPECK","KOPECKS","KOPPA","KOPPAS","KORAS","KORES",
      "KORISTE","KORITE","KORITES","KOSOVAR","KOTAI","KOTAIS","KOTAIT","KOTAMES","KOTANT","KOTAS",
      "KOTASSE","KOTAT","KOTATES","KOTEBA","KOTEBAS","KOTENT","KOTER","KOTERA","KOTERAI","KOTERAS",
      "KOTEREZ","KOTES","KOTEUR","KOTEURS","KOTEUSE","KOTEZ","KOTIEZ","KOTIONS","KOTONS","KOTOS",
      "KOUBA","KOUBAS","KOUBBA","KOUBBAS","KOUDOU","KOUDOUS","KOUFFA","KOUFFAS","KOUGLOF","KOULAK",
      "KOULAKS","KOUMIS","KOUMYS","KOUPREY","KOUROI","KOUROS","KOWEITI","KRAAL","KRAALS","KRACH",
      "KRACHS","KRAFT","KRAFTS","KRAKEN","KRAKENS","KRAKS","KREML","KREMLIN","KREMLS","KREUZER",
      "KRIEK","KRIEKS","KRILL","KRILLS","KRISS","KROUMIR","KRUMP","KRUMPS","KRYPTON","KSARS",
      "KSOUR","KUFIQUE","KUMITE","KUMITES","KUMMEL","KUMMELS","KUMQUAT","KUNAS","KUNGFU","KUNGFUS",
      "KURDE","KURDES","KURSAAL","KURUS","KWACHA","KWACHAS","KWANZA","KWANZAS","KYATS","KYLIX",
      "KYRIE","KYRIES","KYSTE","KYSTES","KYSTEUX","KYUDO","KYUDOS","LACKS","LADAKHI","LAKHS",
      "LAKISTE","LIKAI","LIKAIS","LIKAIT","LIKANT","LIKAS","LIKASSE","LIKAT","LIKATES",
      "LIKEE","LIKEES","LIKENT","LIKER","LIKERA","LIKERAI","LIKERAS","LIKEREZ","LIKES","LIKEZ",
      "LIKIEZ","LIKIONS","LIKONS","LINKAGE","LINKS","LOCKOUT","LOKOUM","LOKOUMS","LOOKE","LOOKEE",
      "LOOKEES","LOOKES","LOOKS","LOUKOUM","MAKAIRE","MAKHZEN","MAKILA","MAKILAS","MAKIS","MAKORE",
      "MAKORES","MAKOS","MAKOSSA","MAKROUD","MAKROUT","MAKTOUB","MALEKI","MALEKIS","MALINKE",
      "MARKETA","MARKETE","MARKHOR","MARKKA","MARKKAA","MARKKAS","MARKS","MAZOUKS","MAZURKA",
      "MBALAKH","MEKTOUB","MELKITE","MIKADOS","MIKVE","MIKVES","MILKBAR","MOHAWK","MOHAWKS","MOKAS",
      "MOKOS","MONOSKI","MOOKS","MOTOSKI","MOUJIKS","MOUKERE","NAGAIKA","NAHAIKA","NAKFA",
      "NANKIN","NANKINS","NANSOUK","NANZOUK","NASKAPI","NEBKA","NEBKAS","NEBKHA","NEBKHAS","NECKS",
      "NETBOOK","NETSUKE","NICKEL","NICKELA","NICKELE","NICKELS","NIKKEI","NIKKEIS","NOUKTA",
      "NOUKTAS","NUBUCKS","OKAPI","OKOUME","OKRAS","OSTIAK","OSTIAKS","OSTRAKA",
      "OSTYAKS","OUAKARI","OUBYKHS","OUKASE","OUKASES","OUMIAK","OUMIAKS","OUZBEKE",
      "OUZBEKS","PACKAGE","PACKS","PAKOL","PANENKA","PANKA","PANKAS","PAPRIKA","PARKA",
      "PARKAS","PARKING","PARKOUR","PASHKA","PASHKAS","PEKAN","PEKANS","PEKET","PEKETS","PEKIN",
      "PEKINE","PEKINEE","PEKINES","PEKINS","PEKOE","PEKOES","PIBROCK","PICKLES","PICKUP","PICKUPS",
      "PIKAS","PIROJKI","PIROJOK","PLOUKS","POKERS","POKES","POLKA","POLKAS","POTTOCK",
      "POTTOK","POTTOKS","PRAKRIT","PRUSSIK","PUCKS","PUNKS","QUAKER","QUAKERS","QUARK","QUARKS",
      "QUICK","QUICKS","QUOKKA","QUOKKAS","RABASKA","RACKET","RACKETS","RACKS","RAKIS","RAKUS",
      "RASKOL","RASKOLS","RECKS","REIKI","REIKIS","RELOOKA","RELOOKE","REMAKE","REMAKES","RIKIKI",
      "RIKIKIS","RIKIO","RIKIOS","ROCKER","ROCKERS","ROCKET","ROCKETS","ROCKEUR","ROCKS","ROKHS",
      "ROOKERY","ROOKIE","ROOKIES","RUCKING","RUCKS","RYOKAN","RYOKANS","SAKES","SAKIEH","SAKIEHS",
      "SAKIS","SAKTI","SAKTIS","SANDJAK","SCHAKO","SCHAKOS","SCHEIKH","SCHEIKS","SCHNECK",
      "SEBKA","SEBKHA","SEBKHAS","SEBKRA","SEBKRAS","SEPPUKU","SHAKER","SHAKERS","SHAKEUR",
      "SHAKO","SHAKOS","SHAKTI","SHAKTIS","SHARKA","SHARKAS","SHEIKH","SHEIKHS","SHEKEL","SHEKELS",
      "SHEKINA","SIFAKA","SIFAKAS","SIKAS","SIKHARA","SIKHE","SIKHES","SIKHS","SIRTAKI","SKAIS",
      "SKATE","SKATER","SKATERS","SKATES","SKATEUR","SKATING","SKATS","SKEET","SKEETS","SKETCH",
      "SKETCHS","SKIABLE","SKIAI","SKIAIS","SKIAIT","SKIAMES","SKIANT","SKIAS","SKIASSE","SKIAT",
      "SKIATES","SKIBOB","SKIBOBS","SKIEE","SKIEES","SKIENT","SKIER","SKIERA","SKIERAI","SKIERAS",
      "SKIEREZ","SKIES","SKIEUR","SKIEURS","SKIEUSE","SKIEZ","SKIFEUR","SKIFF","SKIFFS","SKIFS",
      "SKIIEZ","SKIIONS","SKIMMER","SKIMMIA","SKINS","SKIONS","SKIPPA","SKIPPAI","SKIPPAS","SKIPPAT",
      "SKIPPE","SKIPPEE","SKIPPER","SKIPPES","SKIPPEZ","SKIPS","SKONS","SKUAS","SKUNKS","SKUNS",
      "SKYDOME","SKYRS","SKYSURF","SLIKKE","SLIKKES","SMACK","SMACKS","SMOCKE","SMOCKEE","SMOCKES",
      "SMOCKS","SMOKING","SMOKS","SNACK","SNACKA","SNACKAI","SNACKAS","SNACKAT","SNACKE","SNACKEE",
      "SNACKER","SNACKES","SNACKEZ","SNACKS","SNEAKER","SNOOKER","SOCKET","SOCKETS","SODOKU","SODOKUS",
      "SONINKE","SOUKHOT","SOUKKOT","SOUKS","SOUSLIK","SOVKHOZ","SPEAKER","SPECK","SPECKS","STEAK",
      "STEAKS","STICKER","STICKS","STOCKA","STOCKAI","STOCKAS","STOCKAT","STOCKE","STOCKEE",
      "STOCKER","STOCKES","STOCKEZ","STOCKS","STOECK","STOECKS","STOKER","STOKERS","STOKES","STRIKE",
      "STRIKES","STUKA","STUKAS","SUDOKU","SUDOKUS","SUFFOLK","SULKIES","SULKY","SULKYS","TABASKI",
      "TACKS","TADJIKE","TADJIKS","TAKAHES","TAKAS","TAKIN","TAKINS","TALPACK","TANKA",
      "TANKAS","TANKER","TANKERS","TANKS","TATAKI","TATAKIS","TECKEL","TECKELS","TECKS","TEKEE",
      "TEKEES","TEKES","TELESKI","TICKET","TICKETS","TIKIS","TOKAI","TOKAIS","TOKAJ","TOKAJS",
      "TOKAMAK","TOKAY","TOKAYS","TOKOMAK","TOMAWAK","TONKA","TONKAS","TRACKER","TREKKA",
      "TREKKAI","TREKKAS","TREKKAT","TREKKE","TREKKER","TREKKES","TREKKEZ","TREKS","TRICK","TRICKS",
      "TRIKE","TRIKES","TROIKA","TROIKAS","TRUCKS","TUGRIK","TUGRIKS","TWERKS","UKASE",
      "UKASES","UKULELE","UZBEK","UZBEKE","UZBEKES","UZBEKS","VEDIKA","VEDIKAS","VELOSKI","VIKING",
      "VIKINGS","VODKA","VODKAS","VOLAPUK","WAKAME","WAKAMES","WALKMAN","WEEKEND","WHISKEY","WHISKY",
      "WHISKYS","WIKIS","WISKI","WISKIS","WOKES","WOKISME","YACKS","YAKAS","YAKOUTE","YAKUSA",
      "YAKUSAS","YAKUZA","YAKUZAS","YANKEE","YANKEES","YAPOCKS","YUKATA","YUKATAS",
      "YUKOS","ZAKAT","ZAKATS","ZAMAK","ZAMAKS","ZELKOVA","ZIKRS","ZINNEKE","ZOUKA","ZOUKAI",
      "ZOUKAIS","ZOUKAIT","ZOUKANT","ZOUKAS","ZOUKAT","ZOUKE","ZOUKENT","ZOUKER","ZOUKERA","ZOUKES",
      "ZOUKEUR","ZOUKEZ","ZOUKIEZ","ZOUKONS","ZOUKS","ZYKLON","ZYKLONS",
    ];
    K_WORDS_ODS9.forEach(w => DICT.add(w));

    // Mots avec accents spéciaux mal gérés par la normalisation NFD
    ["AWALE","AWALES","AWELE","AWELES",
     "GAITE","GAITES","BOITE","BOITES","BOITER","CROITE","CROITES",
     "FLUTE","FLUTES","FLUTER","GITE","GITES","GITER",
     "CHAINE","CHAINES","CHAINER","TRAINEE","TRAINEES",
     "BRULER","BRULEUR","BRULURE","BRULIS"].forEach(w => DICT.add(w));
    bar.style.width = "100%";
    msg.textContent = `${DICT.size.toLocaleString()} mots chargés ✓`;
    await sleep(400);
    document.getElementById("loading").classList.add("hidden");
    showScreen("splash");
    if (!localStorage.getItem("fw_tuto_seen")) showTutorial(0);
  } catch(err) {
    msg.textContent = "Hors ligne — dictionnaire de secours chargé";
    bar.style.width = "100%";
    loadFallback();
    await sleep(800);
    document.getElementById("loading").classList.add("hidden");
    showScreen("splash");
    if (!localStorage.getItem("fw_tuto_seen")) showTutorial(0);
  }
}

function loadFallback() {
  const basics = `ABAISSER ABATTRE ABRITER ACCEDER ACHETER AJOUTER ALLUMER
AMENER AMUSER APPELER APPORTER ARRETER ARRIVER ASSURER ATTEINDRE ATTENDRE
BAISSER BALADE BALLADE BATTRE BLESSER BRILLER BRISER
CASSER CHANTER CHERCHER CLAQUER COLLER COMPTER COUPER COURIR COUVRIR CROIRE
DANSER DECOUVRIR DEMANDER DONNER DORMIR DRESSER
ECOUTER ECRIRE ENTRER ESPERER ESSAYER ETUDIER EVITER EXISTER
FAIRE FALLOIR FERMER FINIR FLOTTER FORMER FRAPPER
GAGNER GARDER GLISSER GRANDIR
HABITER HAUSSER HURLER IMAGINER IMITER IMPOSER
JOUER JETER JUGER LANCER LAISSER LEVER LIBERER LUTTER
MARCHER MENTIR METTRE MONTER MOURIR
NOMMER NOTER NOURRIR OBTENIR OUVRIR
PARLER PARTIR PASSER PENSER PERDRE PLAIRE PORTER POSER POUSSER PRENDRE POUVOIR
RANGER RATER REFUSER RENDRE RENTRER RESTER RETIRER REVENIR
SAVOIR SEMBLER SERVIR SORTIR SOUFFRIR SUIVRE
TENDRE TERMINER TENIR TIRER TOMBER TOUCHER TROUVER
UTILISER VALOIR VENDRE VENIR VIVRE VOIR VOLER
FRANGE TOUTE TOURTE CHOUETTE TABLE PIANO SURFER CHANTER
TABLE CHAISE FLEUR ARBRE MAISON JARDIN VOITURE ENFANT AMOUR MONDE`.trim().split(/\s+/);
  for (const w of basics) {
    if (w.length >= 5 && w.length <= 15) DICT.add(w.toUpperCase());
  }
}

function checkWord(word) {
  const clean = word.normalize("NFD").replace(/[̀-ͯ]/g,"").toUpperCase().replace(/[^A-Z]/g,"");
  return DICT.has(clean);
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function calcBonus(wordList) {
  const cnt = {5:0,6:0,7:0,8:0,9:0,10:0};
  wordList.forEach(w => { const l=Math.min(w.length,10); cnt[l>=10?10:l]++; });
  let len = 0;
  len += cnt[6]*1; len += cnt[7]*2; len += cnt[8]*3; len += cnt[9]*5; len += cnt[10]*10;

  // Chaque figure est comptée indépendamment (pas de hiérarchie)
  // Un même mot peut contribuer à plusieurs figures à la fois
  const qf = Math.min(cnt[6],cnt[7],cnt[8],cnt[9],cnt[10]); // séries Quinte Flush (6+7+8+9+10+)
  const q  = Math.min(cnt[5],cnt[6],cnt[7],cnt[8],cnt[9]);  // séries Quinte (5+6+7+8+9)
  const qa = Math.min(cnt[5],cnt[6],cnt[7],cnt[8]);          // séries Quarte (5+6+7+8)

  const fig = qf*75 + q*50 + qa*25;

  let figLabel = null;
  if (qf > 0) figLabel = qf > 1 ? `${qf}× QUINTE FLUSH !` : "QUINTE FLUSH !";
  else if (q > 0) figLabel = q > 1 ? `${q}× QUINTE !` : "QUINTE !";
  else if (qa > 0) figLabel = qa > 1 ? `${qa}× QUARTE !` : "QUARTE !";

  return {len, fig, figLabel, qf, q, qa};
}

let state = {
  screen:"splash", diffIdx:0, grid:[], selection:[], wordList:[],
  score:0, mistakes:0, activeTab:0, intervalId:null,
  toastTimer:null, bonusTimer:null, deck:[],
};

function showScreen(name) {
  state.screen = name;
  document.querySelectorAll(".screen").forEach(el => el.classList.remove("active"));
  document.getElementById(name).classList.add("active");
}

function buildSplash() {
  const list = document.getElementById("diff-list");
  list.innerHTML = "";
  DIFFICULTY.forEach((d, i) => {
    const btn = document.createElement("button");
    btn.className = "diff-btn" + (i===state.diffIdx?" sel":"");
    btn.innerHTML = `<span>${d.icon}</span><span>${d.label}</span><span class="spd">1 carte / ${d.ms/1000}s</span>`;
    btn.onclick = () => {
      state.diffIdx = i;
      document.querySelectorAll(".diff-btn").forEach(b => b.classList.remove("sel"));
      btn.classList.add("sel");
    };
    list.appendChild(btn);
  });
}

function emptyCell(id) {
  return {id, letter:null, revealed:false, selected:false, valid:false, gone:false};
}

function drawLetter() {
  if (state.deck.length === 0) state.deck = shuffle([...LETTER_POOL]);
  return state.deck.shift();
}

function startGame() {
  if (state.intervalId) { clearInterval(state.intervalId); clearTimeout(state.intervalId); }
  const gridEl = document.getElementById("grid");
  if (gridEl) gridEl.innerHTML = "";

  // Ne pas écraser le deck si déjà défini (mode daily ou duel)
  if (!state.deck || !state.deck.length) {
    state.deck = shuffle([...LETTER_POOL]);
  }
  state.grid = Array.from({length:20},(_,i) => emptyCell(i));
  state.selection     = [];
  state.wordList      = [];
  state.score         = 0;
  state.mistakes      = 0;
  state.activeTab     = 0;
  state.lastCardTimer = null;

  const allIdx = shuffle([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19]);
  const first5 = allIdx.slice(0, 5);
  first5.forEach(i => {
    state.grid[i].letter = drawLetter();
    state.grid[i].revealed = true;
  });

  renderGame();
  showScreen("game");

  setTimeout(() => { first5.forEach(i => flipCard(i)); }, 50);

  // Mode POP du jour : vitesse progressive selon le score
  // Phase 1 : 0-99 pts → 🌙 Moon (5s), Phase 2 : 100-199 pts → ⭐ Star (4s), Phase 3 : 200+ pts → ☄️ Comet (3s)
  function getDailyMs() {
    if (!isDailyMode) return DIFFICULTY[state.diffIdx].ms;
    if (state.score >= 200) return 3000; // Sharp
    if (state.score >= 100) return 4000; // Cool
    return 5000; // Slow
  }
  function getDailyPhaseIcon() {
    if (!isDailyMode) return null;
    if (state.score >= 200) return { icon:"🐟", label:"Sharp" };
    if (state.score >= 100) return { icon:"🐢", label:"Cool" };
    return { icon:"🐌", label:"Slow" };
  }

  let ms = getDailyMs();
  function scheduleNext() {
    ms = getDailyMs();
    // Mettre à jour l'indicateur de phase si mode daily
    if (isDailyMode) {
      const phase = getDailyPhaseIcon();
      const iconEl = document.getElementById("diff-icon");
      const nameEl = document.getElementById("diff-name");
      if (iconEl) iconEl.textContent = phase.icon;
      if (nameEl) nameEl.textContent = phase.label;
    }
    state.intervalId = setTimeout(runInterval, ms);
  }
  // Exposer pour permettre le redémarrage depuis handleValidate
  state.restartInterval = scheduleNext;

  function runInterval() {
    if (state.screen !== "game") return;
    if (!state.grid || state.grid.length === 0) return; // guard contre état non initialisé
    const hidden = state.grid.map((c,i) => (!c.revealed ? i : -1)).filter(i => i !== -1);
    if (hidden.length === 0) {
      // Toutes les cartes révélées — déjà géré par lastCardTimer, ne pas déclencher ici
      return;
    }
    const idx = hidden[Math.floor(Math.random() * hidden.length)];
    state.grid[idx].letter = drawLetter();
    state.grid[idx].revealed = true;
    flipCard(idx);
    renderProgDots();
    if (state.grid.every(c => c.revealed)) {
      // Dernière lettre — laisser le temps du niveau avant de terminer
      // Ce timer est annulable si un mot est validé avant son expiration
      state.lastCardTimer = setTimeout(() => {
        // Vérifier si la grille est toujours pleine (aucun mot validé entretemps)
        if (state.grid.every(c => c.revealed || c.gone)) {
          triggerGameOver("grid_full");
        } else {
          // Un mot a été validé, des cases sont libérées — continuer !
          state.lastCardTimer = null;
          scheduleNext();
        }
      }, getDailyMs());
      return;
    }
    scheduleNext();
  }

    scheduleNext();
}

// Flip animé : dos → face
function flipCard(id) {
  const container = document.getElementById("grid");
  const el = container.children[id];
  if (!el) return;
  const inner = el.querySelector(".card-inner");
  el.querySelector(".card-face").textContent = state.grid[id].letter || "";
  // Partir de 0° sans transition, puis laisser la CSS animer vers 180°
  inner.style.transition = "none";
  inner.style.transform  = "rotateY(0deg)";
  el.className = "card";
  void inner.offsetWidth;
  inner.style.transition = "";
  inner.style.transform  = "";
  el.className = "card revealed";
}

// Reset instantané : face → dos, SANS animation
function resetCard(id) {
  const container = document.getElementById("grid");
  const el = container.children[id];
  if (!el) return;
  const inner = el.querySelector(".card-inner");
  // Couper la transition, remettre à 0° (dos), effacer la lettre
  inner.style.transition = "none";
  inner.style.transform  = "rotateY(0deg)";
  el.className = "card";
  el.querySelector(".card-face").textContent = "";
  // Forcer le reflow pour que l'état soit peint immédiatement
  void inner.offsetWidth;
  // Réactiver la transition pour le prochain flipCard
  inner.style.transition = "";
  inner.style.transform  = "";
}

function triggerGameOver(reason) {
  if (state.intervalId) { clearInterval(state.intervalId); clearTimeout(state.intervalId); }
  if (state.lastCardTimer) { clearTimeout(state.lastCardTimer); state.lastCardTimer = null; }
  if (state.screen === "gameover") return; // éviter double déclenchement
  state.screen = "gameover";
  renderGameOver(reason);
  showScreen("gameover");
  // Sauvegarder la partie
  const level = DIFFICULTY[state.diffIdx].label;
  lastGameResult = { score: state.score, level, wordCount: state.wordList.length };
  if (typeof saveGame === "function") saveGame(state.score, state.wordList, level);
  if (isDuelMode && typeof saveDuelScore === "function") {
    saveDuelScore(state.score, state.wordList).then(() => {
      if (typeof showDuelResult === "function") showDuelResult();
    });
  }
}

function handleCellClick(id) {
  const cell = state.grid[id];
  if (!cell || !cell.revealed || cell.gone) return;
  const sel = state.selection;
  let newSel;
  if (sel.includes(id)) {
    if (sel[sel.length-1] !== id) return;
    newSel = sel.slice(0, -1);
  } else {
    newSel = [...sel, id];
  }
  state.selection = newSel;
  state.grid.forEach(c => { c.selected = newSel.includes(c.id); c.valid = false; });
  if (newSel.length >= 5) {
    const word = newSel.map(id => state.grid[id].letter).join("");
    if (checkWord(word)) newSel.forEach(id => { state.grid[id].valid = true; });
  }
  renderGrid();
  renderWordDisplay();
  renderValidateBtn();
}

function clearSelection() {
  state.selection = [];
  state.grid.forEach(c => { c.selected = false; c.valid = false; });
  renderGrid();
  renderWordDisplay();
  renderValidateBtn();
}

function handleValidate() {
  const sel = state.selection;
  if (sel.length < 5) return;
  const word = sel.map(id => state.grid[id].letter).join("");
  if (!checkWord(word)) {
    showToast(`"${word}" absent du dictionnaire`);
    const wd = document.getElementById("word-display");
    wd.classList.add("shake");
    setTimeout(() => wd.classList.remove("shake"), 400);
    return;
  }
  if (state.wordList.includes(word)) {
    showToast(`"${word}" déjà dans la liste !`);
    state.mistakes++;
    if (state.mistakes >= 3) setTimeout(() => triggerGameOver("mistakes"), 500);
    renderMistakes();
    const wd = document.getElementById("word-display");
    wd.classList.add("shake");
    setTimeout(() => { wd.classList.remove("shake"); clearSelection(); }, 700);
    return;
  }

  const ids = [...sel];
  const prevList = [...state.wordList];
  state.wordList.push(word);
  state.score += word.length;

  const pb = calcBonus(prevList);
  const nb = calcBonus(state.wordList);
  if (nb.fig > pb.fig && nb.figLabel) {
    state.score += (nb.fig - pb.fig);
    showBonusBadge(nb.figLabel);
  }

  const l = word.length;
  state.activeTab = l>=10?5 : l>=9?4 : l>=8?3 : l>=7?2 : l>=6?1 : 0;

  ids.forEach(id => { state.grid[id].gone = true; state.grid[id].selected = false; state.grid[id].valid = false; });
  state.selection = [];
  // Mot validé — annuler le timer de fin si on était sur la dernière carte
  if (state.lastCardTimer) {
    clearTimeout(state.lastCardTimer);
    state.lastCardTimer = null;
    // Relancer le chrono après l'animation de disparition des cartes (350ms)
    setTimeout(() => {
      if (state.screen === "game" && state.restartInterval) {
        state.restartInterval();
      }
    }, 360);
  }
  renderGrid();
  renderWordDisplay();
  renderValidateBtn();
  renderScore();
  renderWordPanel();

  // Après l'animation gone : reset instantané dos visible, sans flip
  setTimeout(() => {
    ids.forEach(id => {
      state.grid[id] = emptyCell(id);
      resetCard(id);
    });
  }, 350);
}

// ── RENDER ──


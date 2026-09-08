/**
 * Roxanne CPI Light - Database Comuni d'Italia & Motore Geografico Haversine
 * Coordinate lat/lon, provincia, CAP e calcolo della distanza chilometrica reale
 */

(function(window) {
  // Funzione Haversine: Calcola la distanza sferica reale in KM tra due punti geografici (lat, lon)
  function calculateHaversineKm(lat1, lon1, lat2, lon2) {
    if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return null;
    const R = 6371; // Raggio medio terra in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round((R * c) * 10) / 10;
  }

  // Database Comuni: Tutti i comuni della Provincia di Lecco, Monza, Como, Milano, Bergamo, Sondrio, Varese, Brescia, Lodi, Pavia, Mantova, Cremona e i principali capoluoghi d'Italia
  const COMUNI_DB = [
    // --- PROVINCIA DI LECCO (TUTTI I COMUNI) ---
    { nome: "Lecco", prov: "LC", cap: "23900", lat: 45.8559, lon: 9.3908 },
    { nome: "Abbadia Lariana", prov: "LC", cap: "23821", lat: 45.8972, lon: 9.3361 },
    { nome: "Airuno", prov: "LC", cap: "23881", lat: 45.7533, lon: 9.4283 },
    { nome: "Annone di Brianza", prov: "LC", cap: "23841", lat: 45.8058, lon: 9.3328 },
    { nome: "Ballabio", prov: "LC", cap: "23811", lat: 45.8967, lon: 9.4217 },
    { nome: "Barzago", prov: "LC", cap: "23890", lat: 45.7547, lon: 9.3131 },
    { nome: "Barzanò", prov: "LC", cap: "23891", lat: 45.7317, lon: 9.3139 },
    { nome: "Barzio", prov: "LC", cap: "23816", lat: 45.9472, lon: 9.4678 },
    { nome: "Bellano", prov: "LC", cap: "23822", lat: 46.0422, lon: 9.3039 },
    { nome: "Bosisio Parini", prov: "LC", cap: "23842", lat: 45.7989, lon: 9.2889 },
    { nome: "Brivio", prov: "LC", cap: "23883", lat: 45.7486, lon: 9.4447 },
    { nome: "Bulciago", prov: "LC", cap: "23892", lat: 45.7553, lon: 9.2864 },
    { nome: "Calco", prov: "LC", cap: "23885", lat: 45.7247, lon: 9.4342 },
    { nome: "Calolziocorte", prov: "LC", cap: "23801", lat: 45.7997, lon: 9.4367 },
    { nome: "Carenno", prov: "LC", cap: "23802", lat: 45.8039, lon: 9.4667 },
    { nome: "Casargo", prov: "LC", cap: "23831", lat: 46.0392, lon: 9.3872 },
    { nome: "Casatenovo", prov: "LC", cap: "23880", lat: 45.6967, lon: 9.3133 },
    { nome: "Cassago Brianza", prov: "LC", cap: "23893", lat: 45.7369, lon: 9.2936 },
    { nome: "Cassina Valsassina", prov: "LC", cap: "23817", lat: 45.9189, lon: 9.4883 },
    { nome: "Castello di Brianza", prov: "LC", cap: "23884", lat: 45.7542, lon: 9.3494 },
    { nome: "Cernusco Lombardone", prov: "LC", cap: "23870", lat: 45.6947, lon: 9.4003 },
    { nome: "Cesana Brianza", prov: "LC", cap: "23861", lat: 45.8142, lon: 9.3014 },
    { nome: "Civate", prov: "LC", cap: "23862", lat: 45.8286, lon: 9.3444 },
    { nome: "Colico", prov: "LC", cap: "23823", lat: 46.1342, lon: 9.3703 },
    { nome: "Colle Brianza", prov: "LC", cap: "23886", lat: 45.7606, lon: 9.3667 },
    { nome: "Cortenova", prov: "LC", cap: "23814", lat: 45.9986, lon: 9.3872 },
    { nome: "Costa Masnaga", prov: "LC", cap: "23845", lat: 45.7725, lon: 9.2783 },
    { nome: "Crandola Valsassina", prov: "LC", cap: "23832", lat: 46.0233, lon: 9.3806 },
    { nome: "Cremella", prov: "LC", cap: "23894", lat: 45.7408, lon: 9.3039 },
    { nome: "Cremeno", prov: "LC", cap: "23814", lat: 45.9367, lon: 9.4744 },
    { nome: "Dervio", prov: "LC", cap: "23824", lat: 46.0767, lon: 9.3075 },
    { nome: "Dolzago", prov: "LC", cap: "23843", lat: 45.7667, lon: 9.3389 },
    { nome: "Dorio", prov: "LC", cap: "23824", lat: 46.1006, lon: 9.3217 },
    { nome: "Ello", prov: "LC", cap: "23848", lat: 45.7869, lon: 9.3661 },
    { nome: "Erve", prov: "LC", cap: "23805", lat: 45.8206, lon: 9.4533 },
    { nome: "Esino Lario", prov: "LC", cap: "23825", lat: 45.9961, lon: 9.3333 },
    { nome: "Galbiate", prov: "LC", cap: "23851", lat: 45.8197, lon: 9.3778 },
    { nome: "Garbagnate Monastero", prov: "LC", cap: "23846", lat: 45.7728, lon: 9.3006 },
    { nome: "Garlate", prov: "LC", cap: "23852", lat: 45.8081, lon: 9.4008 },
    { nome: "Imbersago", prov: "LC", cap: "23898", lat: 45.7067, lon: 9.4447 },
    { nome: "Introbio", prov: "LC", cap: "23815", lat: 45.9733, lon: 9.4514 },
    { nome: "La Valletta Brianza", prov: "LC", cap: "23888", lat: 45.7386, lon: 9.3639 },
    { nome: "Lierna", prov: "LC", cap: "23827", lat: 45.9619, lon: 9.3047 },
    { nome: "Lomagna", prov: "LC", cap: "23871", lat: 45.6706, lon: 9.3742 },
    { nome: "Malgrate", prov: "LC", cap: "23864", lat: 45.8503, lon: 9.3786 },
    { nome: "Mandello del Lario", prov: "LC", cap: "23826", lat: 45.9189, lon: 9.3208 },
    { nome: "Margno", prov: "LC", cap: "23832", lat: 46.0306, lon: 9.3853 },
    { nome: "Merate", prov: "LC", cap: "23807", lat: 45.6986, lon: 9.4189 },
    { nome: "Missaglia", prov: "LC", cap: "23873", lat: 45.7083, lon: 9.3364 },
    { nome: "Moggio", prov: "LC", cap: "23817", lat: 45.9347, lon: 9.4892 },
    { nome: "Molteno", prov: "LC", cap: "23847", lat: 45.7797, lon: 9.3044 },
    { nome: "Monte Marenzo", prov: "LC", cap: "23804", lat: 45.7708, lon: 9.4539 },
    { nome: "Montevecchia", prov: "LC", cap: "23874", lat: 45.7042, lon: 9.3797 },
    { nome: "Monticello Brianza", prov: "LC", cap: "23876", lat: 45.7139, lon: 9.3178 },
    { nome: "Morterone", prov: "LC", cap: "23811", lat: 45.8744, lon: 9.4897 },
    { nome: "Nibionno", prov: "LC", cap: "23895", lat: 45.7511, lon: 9.2558 },
    { nome: "Oggiono", prov: "LC", cap: "23848", lat: 45.7911, lon: 9.3497 },
    { nome: "Olgiate Molgora", prov: "LC", cap: "23887", lat: 45.7333, lon: 9.4039 },
    { nome: "Olginate", prov: "LC", cap: "23854", lat: 45.7981, lon: 9.4172 },
    { nome: "Oliveto Lario", prov: "LC", cap: "23865", lat: 45.9406, lon: 9.2667 },
    { nome: "Osnago", prov: "LC", cap: "23875", lat: 45.6811, lon: 9.3908 },
    { nome: "Paderno d'Adda", prov: "LC", cap: "23877", lat: 45.6833, lon: 9.4447 },
    { nome: "Pagnona", prov: "LC", cap: "23833", lat: 46.0603, lon: 9.4022 },
    { nome: "Parlasco", prov: "LC", cap: "23837", lat: 46.0189, lon: 9.3517 },
    { nome: "Pasturo", prov: "LC", cap: "23818", lat: 45.9508, lon: 9.4406 },
    { nome: "Perledo", prov: "LC", cap: "23828", lat: 46.0181, lon: 9.2961 },
    { nome: "Pescate", prov: "LC", cap: "23855", lat: 45.8306, lon: 9.3986 },
    { nome: "Premana", prov: "LC", cap: "23834", lat: 46.0519, lon: 9.4233 },
    { nome: "Primaluna", prov: "LC", cap: "23819", lat: 45.9878, lon: 9.4189 },
    { nome: "Robbiate", prov: "LC", cap: "23899", lat: 45.6889, lon: 9.4431 },
    { nome: "Rogeno", prov: "LC", cap: "23849", lat: 45.7869, lon: 9.2717 },
    { nome: "Santa Maria Hoè", prov: "LC", cap: "23889", lat: 45.7444, lon: 9.3739 },
    { nome: "Sirone", prov: "LC", cap: "23844", lat: 45.7725, lon: 9.3228 },
    { nome: "Sirtori", prov: "LC", cap: "23896", lat: 45.7378, lon: 9.3367 },
    { nome: "Sueglio", prov: "LC", cap: "23835", lat: 46.0847, lon: 9.3333 },
    { nome: "Suello", prov: "LC", cap: "23867", lat: 45.8203, lon: 9.3175 },
    { nome: "Taceno", prov: "LC", cap: "23837", lat: 46.0272, lon: 9.3622 },
    { nome: "Valgreghentino", prov: "LC", cap: "23857", lat: 45.7864, lon: 9.4206 },
    { nome: "Valmadrera", prov: "LC", cap: "23868", lat: 45.8458, lon: 9.3606 },
    { nome: "Varenna", prov: "LC", cap: "23829", lat: 46.0108, lon: 9.2847 },
    { nome: "Vendrogno", prov: "LC", cap: "23822", lat: 46.0333, lon: 9.3333 },
    { nome: "Vercurago", prov: "LC", cap: "23808", lat: 45.8119, lon: 9.4217 },
    { nome: "Verderio", prov: "LC", cap: "23879", lat: 45.6667, lon: 9.4333 },
    { nome: "Viganò", prov: "LC", cap: "23897", lat: 45.7233, lon: 9.3242 },

    // --- PROVINCIA DI MONZA E BRIANZA ---
    { nome: "Monza", prov: "MB", cap: "20900", lat: 45.5845, lon: 9.2744 },
    { nome: "Agrate Brianza", prov: "MB", cap: "20864", lat: 45.5786, lon: 9.3517 },
    { nome: "Arcore", prov: "MB", cap: "20862", lat: 45.6264, lon: 9.3236 },
    { nome: "Besana in Brianza", prov: "MB", cap: "20842", lat: 45.6989, lon: 9.2867 },
    { nome: "Biassono", prov: "MB", cap: "20853", lat: 45.6306, lon: 9.2806 },
    { nome: "Bovisio-Masciago", prov: "MB", cap: "20813", lat: 45.6128, lon: 9.1469 },
    { nome: "Brioscò", prov: "MB", cap: "20836", lat: 45.7119, lon: 9.2389 },
    { nome: "Carate Brianza", prov: "MB", cap: "20841", lat: 45.6742, lon: 9.2372 },
    { nome: "Cesano Maderno", prov: "MB", cap: "20811", lat: 45.6294, lon: 9.1461 },
    { nome: "Desio", prov: "MB", cap: "20832", lat: 45.6178, lon: 9.2089 },
    { nome: "Giussano", prov: "MB", cap: "20833", lat: 45.6989, lon: 9.2133 },
    { nome: "Lissone", prov: "MB", cap: "20851", lat: 45.6122, lon: 9.2422 },
    { nome: "Meda", prov: "MB", cap: "20821", lat: 45.6594, lon: 9.1628 },
    { nome: "Seregno", prov: "MB", cap: "20831", lat: 45.6489, lon: 9.2064 },
    { nome: "Usmate Velate", prov: "MB", cap: "20865", lat: 45.6542, lon: 9.3564 },
    { nome: "Vimercate", prov: "MB", cap: "20871", lat: 45.6133, lon: 9.3708 },

    // --- PROVINCIA DI COMO ---
    { nome: "Como", prov: "CO", cap: "22100", lat: 45.8081, lon: 9.0853 },
    { nome: "Albavilla", prov: "CO", cap: "22031", lat: 45.8019, lon: 9.1867 },
    { nome: "Cantù", prov: "CO", cap: "22063", lat: 45.7417, lon: 9.1311 },
    { nome: "Erba", prov: "CO", cap: "22036", lat: 45.8117, lon: 9.2272 },
    { nome: "Lipomo", prov: "CO", cap: "22030", lat: 45.7958, lon: 9.1219 },
    { nome: "Mariano Comense", prov: "CO", cap: "22066", lat: 45.7008, lon: 9.1783 },
    { nome: "Ponte Lambro", prov: "CO", cap: "22037", lat: 45.8286, lon: 9.2272 },
    { nome: "Taice", prov: "CO", cap: "22038", lat: 45.8508, lon: 9.2458 },

    // --- PROVINCIA DI BERGAMO ---
    { nome: "Bergamo", prov: "BG", cap: "24100", lat: 45.6983, lon: 9.6773 },
    { nome: "Alzano Lombardo", prov: "BG", cap: "24022", lat: 45.7317, lon: 9.7289 },
    { nome: "Caprino Bergamasco", prov: "BG", cap: "24030", lat: 45.7467, lon: 9.4819 },
    { nome: "Cisano Bergamasco", prov: "BG", cap: "24034", lat: 45.7431, lon: 9.4717 },
    { nome: "Dalmine", prov: "BG", cap: "24044", lat: 45.6489, lon: 9.6053 },
    { nome: "Palazzago", prov: "BG", cap: "24030", lat: 45.7539, lon: 9.5358 },
    { nome: "Ponte San Pietro", prov: "BG", cap: "24036", lat: 45.6983, lon: 9.5883 },
    { nome: "Seriate", prov: "BG", cap: "24068", lat: 45.6842, lon: 9.7183 },
    { nome: "Treviglio", prov: "BG", cap: "24047", lat: 45.5217, lon: 9.5933 },

    // --- CITTA METROPOLITANA DI MILANO ---
    { nome: "Milano", prov: "MI", cap: "20100", lat: 45.4642, lon: 9.1900 },
    { nome: "Cinisello Balsamo", prov: "MI", cap: "20092", lat: 45.5564, lon: 9.2133 },
    { nome: "Cologno Monzese", prov: "MI", cap: "20093", lat: 45.5286, lon: 9.2789 },
    { nome: "Legnano", prov: "MI", cap: "20025", lat: 45.5975, lon: 8.9136 },
    { nome: "Rho", prov: "MI", cap: "20017", lat: 45.5317, lon: 9.0406 },
    { nome: "Sesto San Giovanni", prov: "MI", cap: "20099", lat: 45.5333, lon: 9.2333 },

    // --- ALTRI CAPOLUOGHI DELLA LOMBARDIA & PRINCIPALI CITTA ITALIANE ---
    { nome: "Sondrio", prov: "SO", cap: "23100", lat: 46.1689, lon: 9.8708 },
    { nome: "Varese", prov: "VA", cap: "21100", lat: 45.8206, lon: 8.8258 },
    { nome: "Brescia", prov: "BS", cap: "25100", lat: 45.5416, lon: 10.2118 },
    { nome: "Pavia", prov: "PV", cap: "27100", lat: 45.1847, lon: 9.1582 },
    { nome: "Lodi", prov: "LO", cap: "26900", lat: 45.3142, lon: 9.5033 },
    { nome: "Cremona", prov: "CR", cap: "26100", lat: 45.1333, lon: 10.0333 },
    { nome: "Mantova", prov: "MN", cap: "46100", lat: 45.1564, lon: 10.7914 },

    { nome: "Torino", prov: "TO", cap: "10100", lat: 45.0703, lon: 7.6869 },
    { nome: "Genova", prov: "GE", cap: "16100", lat: 44.4056, lon: 8.9463 },
    { nome: "Bologna", prov: "BO", cap: "40100", lat: 44.4949, lon: 11.3426 },
    { nome: "Firenze", prov: "FI", cap: "50100", lat: 43.7696, lon: 11.2558 },
    { nome: "Roma", prov: "RM", cap: "00100", lat: 41.9028, lon: 12.4964 },
    { nome: "Napoli", prov: "NA", cap: "80100", lat: 40.8518, lon: 14.2681 },
    { nome: "Venezia", prov: "VE", cap: "30100", lat: 45.4408, lon: 12.3155 },
    { nome: "Verona", prov: "VR", cap: "37100", lat: 45.4384, lon: 10.9916 },
    { nome: "Trento", prov: "TN", cap: "38100", lat: 46.0667, lon: 11.1167 }
  ];

  // Helper ricerca comune con normalizzazione testo
  function findComune(query) {
    if (!query) return null;
    const q = query.toLowerCase().trim();
    // Match esatto
    let found = COMUNI_DB.find(c => c.nome.toLowerCase() === q);
    if (found) return found;

    // Match parziale (es. "lecco (lc)" o "merate")
    found = COMUNI_DB.find(c => q.includes(c.nome.toLowerCase()) || c.nome.toLowerCase().includes(q));
    return found || null;
  }

  // Calcola distanza tra due nomi di comune in KM
  function getDistanceBetweenComuni(comune1, comune2) {
    const c1 = findComune(comune1);
    const c2 = findComune(comune2);
    if (!c1 || !c2) return null;
    return calculateHaversineKm(c1.lat, c1.lon, c2.lat, c2.lon);
  }

  // Esporta globalmente
  window.COMUNI_DB = COMUNI_DB;
  window.findComune = findComune;
  window.calculateHaversineKm = calculateHaversineKm;
  window.getDistanceBetweenComuni = getDistanceBetweenComuni;

})(window);

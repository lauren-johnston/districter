var states = [
  "al",
  "ak",
  "az",
  "ar",
  "ca",
  "co",
  "ct",
  "dc",
  "de",
  "fl",
  "ga",
  "hi",
  "id",
  "il",
  "in",
  "ia",
  "ks",
  "ky",
  "la",
  "me",
  "md",
  "ma",
  "mi",
  "mn",
  "ms",
  "mo",
  "mt",
  "ne",
  "nv",
  "nh",
  "nj",
  "nm",
  "ny",
  "nc",
  "nd",
  "oh",
  "ok",
  "or",
  "pa",
  "ri",
  "sc",
  "sd",
  "tn",
  "tx",
  "ut",
  "vt",
  "va",
  "wa",
  "wv",
  "wi",
  "wy"
];
let statesDatabase = {
  'AL': 'Alabama',
  'AK': 'Alaska',
  'AS': 'American Samoa',
  'AZ': 'Arizona',
  'AR': 'Arkansas',
  'CA': 'California',
  'CO': 'Colorado',
  'CT': 'Connecticut',
  'DE': 'Delaware',
  'DC': 'District Of Columbia',
  'FM': 'Federated States Of Micronesia',
  'FL': 'Florida',
  'GA': 'Georgia',
  'GU': 'Guam',
  'HI': 'Hawaii',
  'ID': 'Idaho',
  'IL': 'Illinois',
  'IN': 'Indiana',
  'IA': 'Iowa',
  'KS': 'Kansas',
  'KY': 'Kentucky',
  'LA': 'Louisiana',
  'ME': 'Maine',
  'MH': 'Marshall Islands',
  'MD': 'Maryland',
  'MA': 'Massachusetts',
  'MI': 'Michigan',
  'MN': 'Minnesota',
  'MS': 'Mississippi',
  'MO': 'Missouri',
  'MT': 'Montana',
  'NE': 'Nebraska',
  'NV': 'Nevada',
  'NH': 'New Hampshire',
  'NJ': 'New Jersey',
  'NM': 'New Mexico',
  'NY': 'New York',
  'NC': 'North Carolina',
  'ND': 'North Dakota',
  'MP': 'Northern Mariana Islands',
  'OH': 'Ohio',
  'OK': 'Oklahoma',
  'OR': 'Oregon',
  'PW': 'Palau',
  'PA': 'Pennsylvania',
  'PR': 'Puerto Rico',
  'RI': 'Rhode Island',
  'SC': 'South Carolina',
  'SD': 'South Dakota',
  'TN': 'Tennessee',
  'TX': 'Texas',
  'UT': 'Utah',
  'VT': 'Vermont',
  'VI': 'Virgin Islands',
  'VA': 'Virginia',
  'WA': 'Washington',
  'WV': 'West Virginia',
  'WI': 'Wisconsin',
  'WY': 'Wyoming'
}
let statesLngLat = {
  'AK': [-158.7750198, 61.3025006],
  'AL': [-86.6807365, 32.6010112],
  'AR': [-92.1313784, 34.7519275],
  'AZ': [-111.930907, 34.1682185],
  'CA': [-119.2704153, 37.2718745],
  'CO': [-105.550567, 38.9979339],
  'CT': [-72.757507, 41.5187835],
  'DC': [-77.0145666, 38.8993487],
  'DE': [-75.4189206, 39.145251],
  'FL': [-83.8330166, 27.9757279],
  'GA': [-83.2229757, 32.6781248],
  'HI': [-157.505, 20.46],
  'IA': [-93.389798, 41.9383166],
  'ID': [-114.1424303, 45.4945756],
  'IL': [-89.504139, 39.739318],
  'IN': [-86.441277, 39.7662195],
  'KS': [-98.3200779, 38.4987789],
  'KY': [-85.7682399, 37.8222935],
  'LA': [-91.4299097, 30.9733766],
  'MA': [-71.718067, 42.0629398],
  'MD': [-77.2684162, 38.8063524],
  'ME': [-69.0148656, 45.2185133],
  'MI': [-86.4158049, 44.9435598],
  'MN': [-93.3655146, 46.4418595],
  'MO': [-92.437099, 38.3046615],
  'MS': [-89.8772196, 32.5851062],
  'MT': [-110.044783, 46.6797995],
  'NC': [-79.8912675, 35.2145629],
  'ND': [-100.3022655, 47.4678819],
  'NE': [-99.680902, 41.5008195],
  'NH': [-71.5799231, 44.0012306],
  'NJ': [-74.7311156, 40.1430058],
  'NM': [-106.0260685, 34.1662325],
  'NV': [-117.0230604, 38.502032],
  'NY': [-73.97968, 40.7056258],
  'OH': [-82.6692525, 40.1903624],
  'OK': [-98.7165585, 35.3097654],
  'OR': [-120.5380993, 44.1419049],
  'PA': [-77.6046984, 40.9945928],
  'RI': [-71.5064508, 41.5827282],
  'SC': [-80.9470381, 33.62505],
  'SD': [-100.2471641, 44.2126995],
  'TN': [-85.9785989, 35.830521],
  'TX': [-100.0768425, 31.1693363],
  'UT': [-111.547028, 39.4997605],
  'VA': [-79.4587861, 38.0033855],
  'VT': [-72.4477828, 43.8717545],
  'WA': [-120.7401, 47.7511],
  'WI': [-89.8267049, 44.7862968],
  'WV': [-80.1816905, 38.9201705],
  'WY': [-107.5545669, 43.000325]
}
let publicCommentLinks = {
  'co': 'https://redistricting.colorado.gov/public_comments/new',
  'ma': 'https://malegislature.gov/Redistricting/Contact',
  'mo': 'https://house.mo.gov/WitnessForm/Default.aspx?noticeid=5970',
  'mt': 'https://leg.mt.gov/districting/2020-commission/redistricting-input/',
  'nj': 'http://www.apportionmentcommission.org/ContactUs.asp',
  'ok': 'https://www.okhouse.gov/Publications/RedistrictingContacts.aspx',
  'tx': 'https://senate.texas.gov/redistrictingcomment/',
  'wi': 'https://appengine.egov.com/apps/wi/peoplesmaps/writtencomment',
}

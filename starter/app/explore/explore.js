
  const cityOptions = [
  { value: "ATL", label: "Atlanta, GA (ATL)" }, { value: "LAX", label: "Los Angeles, CA (LAX)" },
  { value: "ORD", label: "Chicago, IL (ORD)" }, { value: "DFW", label: "Dallas/Fort Worth, TX (DFW)" },
  { value: "DEN", label: "Denver, CO (DEN)" }, { value: "JFK", label: "New York, NY (JFK)" },
  { value: "SFO", label: "San Francisco, CA (SFO)" }, { value: "SEA", label: "Seattle, WA (SEA)" },
  { value: "LAS", label: "Las Vegas, NV (LAS)" }, { value: "MCO", label: "Orlando, FL (MCO)" },
  { value: "EWR", label: "Newark, NJ (EWR)" }, { value: "CLT", label: "Charlotte, NC (CLT)" },
  { value: "PHX", label: "Phoenix, AZ (PHX)" }, { value: "MIA", label: "Miami, FL (MIA)" },
  { value: "IAH", label: "Houston, TX (IAH)" }, { value: "BOS", label: "Boston, MA (BOS)" },
  { value: "MSP", label: "Minneapolis, MN (MSP)" }, { value: "FLL", label: "Fort Lauderdale, FL (FLL)" },
  { value: "DTW", label: "Detroit, MI (DTW)" }, { value: "PHL", label: "Philadelphia, PA (PHL)" },
  { value: "BWI", label: "Baltimore, MD (BWI)" }, { value: "SLC", label: "Salt Lake City, UT (SLC)" },
  { value: "SAN", label: "San Diego, CA (SAN)" }, { value: "TPA", label: "Tampa, FL (TPA)" },
  { value: "HNL", label: "Honolulu, HI (HNL)" }, { value: "DCA", label: "Washington, D.C. (DCA)" },
  { value: "MDW", label: "Chicago Midway, IL (MDW)" }, { value: "STL", label: "St. Louis, MO (STL)" },
  { value: "PDX", label: "Portland, OR (PDX)" }, { value: "DAL", label: "Dallas Love, TX (DAL)" },
  { value: "AUS", label: "Austin, TX (AUS)" }, { value: "OAK", label: "Oakland, CA (OAK)" },
  { value: "HOU", label: "Houston Hobby, TX (HOU)" }, { value: "MSY", label: "New Orleans, LA (MSY)" },
  { value: "RDU", label: "Raleigh-Durham, NC (RDU)" }, { value: "SJC", label: "San Jose, CA (SJC)" },
  { value: "SMF", label: "Sacramento, CA (SMF)" }, { value: "SNA", label: "Orange County, CA (SNA)" },
  { value: "CLE", label: "Cleveland, OH (CLE)" }, { value: "PIT", label: "Pittsburgh, PA (PIT)" },
  { value: "MKE", label: "Milwaukee, WI (MKE)" }, { value: "CMH", label: "Columbus, OH (CMH)" },
  { value: "IND", label: "Indianapolis, IN (IND)" }, { value: "JAX", label: "Jacksonville, FL (JAX)" },
  { value: "SAT", label: "San Antonio, TX (SAT)" }, { value: "CVG", label: "Cincinnati, OH (CVG)" },
  { value: "PBI", label: "West Palm Beach, FL (PBI)" }, { value: "RSW", label: "Fort Myers, FL (RSW)" },
  { value: "OKC", label: "Oklahoma City, OK (OKC)" },
  //international airports
  { value: "LHR", label: "London Heathrow, UK (LHR)" },
  { value: "CDG", label: "Paris Charles de Gaulle, France (CDG)" },
  { value: "FRA", label: "Frankfurt, Germany (FRA)" },
  { value: "AMS", label: "Amsterdam Schiphol, Netherlands (AMS)" },
  { value: "MAD", label: "Madrid Barajas, Spain (MAD)" },
  { value: "FCO", label: "Rome Fiumicino, Italy (FCO)" },
  { value: "DXB", label: "Dubai, UAE (DXB)" },
  { value: "HKG", label: "Hong Kong, China (HKG)" },
  { value: "SIN", label: "Singapore Changi, Singapore (SIN)" },
  { value: "NRT", label: "Tokyo Narita, Japan (NRT)" },
  { value: "HND", label: "Tokyo Haneda, Japan (HND)" },
  { value: "ICN", label: "Seoul Incheon, South Korea (ICN)" },
  { value: "BKK", label: "Bangkok Suvarnabhumi, Thailand (BKK)" },
  { value: "SYD", label: "Sydney, Australia (SYD)" },
  { value: "GRU", label: "São Paulo Guarulhos, Brazil (GRU)" },
  { value: "YYZ", label: "Toronto Pearson, Canada (YYZ)" },
  { value: "YVR", label: "Vancouver, Canada (YVR)" },
  { value: "MEX", label: "Mexico City, Mexico (MEX)" },
  { value: "JNB", label: "Johannesburg OR Tambo, South Africa (JNB)" },
  { value: "CAI", label: "Cairo, Egypt (CAI)" }
];

new Choices("#originSelect", {
    searchEnabled: true,
    choices: cityOptions,
    placeholderValue: "Select origin...",
});

new Choices("#destinationSelect", {
    searchEnabled: true,
    choices: cityOptions,
    placeholderValue: "Select destination...",
});
let results = document.getElementById("results");

document.getElementById("exploreForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const origin = document.getElementById("originSelect").value;
    const destination = document.getElementById("destinationSelect").value;
    const departureDate = document.getElementById("departureDate").value;

    searchFlights(origin, destination, departureDate);
});

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const date = tomorrow.toISOString().split("T")[0];

loadPopularRoute("JFK", "LAX", date, "route-jfk-lax");
loadPopularRoute("ORD", "LAS", date, "route-ord-las");

async function searchFlights(origin, destination, departureDate) {
    results.innerHTML = 'Finding flights...';

    try {
        const tokenRes = await fetch("/amadeus/token");
        const { access_token: token } = await tokenRes.json();


        const flights = await searchRoute(token, origin, destination, departureDate);
        displayResults(flights.slice(0, 3));
    } catch (err) {
        console.error(err);
        results.innerHTML = 'Error fetching flights';
    }
}

async function searchRoute(token, origin, destination, departureDate) {
    const apiUrl = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${departureDate}&adults=1&nonStop=false&currencyCode=USD&max=20`;

    const response = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      results.innerText = "No flights found.";
      return;
    }

    let flights = data.data;
    return flights;
}


function displayResults(flights) {
    const results = document.getElementById("results");

    if (!flights || flights.length === 0) {
        results.innerHTML = 'No flights found';
        return;
    }

    let html = '<div class="card"><div class="card-body"><h5>Top Flights</h5>';

    flights.forEach((flight) => {
        const price = `${flight.price.total} ${flight.price.currency}`;
        const itinerary = flight.itineraries[0];
        const segments = itinerary.segments;
        const firstFlight = segments[0];
        const lastFlight = segments[segments.length - 1];
        const duration = (itinerary.duration || "").replace("PT", "").toLowerCase();

        html += `
        <div class="border-bottom pb-3 mb-3">
            <h6>${firstFlight.departure.iataCode} → ${lastFlight.arrival.iataCode} -
            <span class="text-primary">${price}</span></h6>
            <p class="mb-1 text-muted">
            ${firstFlight.carrierCode} ${firstFlight.number} - Duration: ${duration}
            </p>
            <p class="mb-0 text-muted">
            Departure: ${new Date(firstFlight.departure.at).toLocaleDateString()}
            ${new Date(firstFlight.departure.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
            <p class="mb-0 text-muted">
            Arrival: ${new Date(lastFlight.arrival.at).toLocaleDateString()}
            ${new Date(lastFlight.arrival.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
        </div>
        `;
    });

    html += "</div></div>";
    results.innerHTML = html;
}

async function loadPopularRoute(origin, destination, departureDate, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "Finding flights...";

    try {
        const tokenRes = await fetch("/amadeus/token");
        const { access_token: token } = await tokenRes.json();

        const flights = await searchRoute(token, origin, destination, departureDate);
        const top = flights.slice(0, 3);

        if (!top.length) {
            container.innerHTML = "No flights found";
            return;
        }

        let html = "<ul class='list-unstyled small mb-0'>";
        top.forEach((flight) => {
            const price = `${flight.price.total} ${flight.price.currency}`;
            const it = flight.itineraries[0];
            const first = it.segments[0];
            const last = it.segments[it.segments.length - 1];

            html += `
                <li class="mb-2">
                <strong>${price}</strong><br>
                ${new Date(first.departure.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                → ${new Date(last.arrival.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </li>
            `;
        });
        html += "</ul>";

        container.innerHTML = html;
    } catch (err) {
        console.error(err);
        container.innerHTML = "'Error fetching flights.";
    }
}

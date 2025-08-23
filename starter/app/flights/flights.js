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
  { value: "OKC", label: "Oklahoma City, OK (OKC)" }
];

new Choices('#originSelect', {
  searchEnabled: true,
  choices: cityOptions,
  placeholderValue: 'Select origin...'
});

new Choices('#destinationSelect', {
  searchEnabled: true,
  choices: cityOptions,
  placeholderValue: 'Select destination...'
});

let results = document.getElementById("results");

document.getElementById('flightForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const spinner = document.getElementById('spinner');
  const seeMoreBtn = document.getElementById('seeMoreBtn');
  const submitSection = document.getElementById('submitSection');

  results.innerHTML = "Finding flights.";
  spinner.style.display = 'block';
  seeMoreBtn.classList.add('hidden');
  submitSection.classList.add('hidden');
  allFlights = [];
  displayedFlights = 0;
  selectedFlights = [];

  const origin = document.getElementById('originSelect').value;
  const destination = document.getElementById('destinationSelect').value;
  const departureDate = document.getElementById('departureDate').value;
  const returnDate = document.getElementById('returnDate').value;
  const adults = document.getElementById('adults').value;
  const children = document.getElementById('children').value;
  const infants = document.getElementById('infants').value;
  const travelClass = document.getElementById('travelClass').value;
  
  try { 
    const tokenRes = await fetch("/amadeus/token");
    const { access_token: token } = await tokenRes.json();

    let apiUrl = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${departureDate}&adults=${adults}&nonStop=false&currencyCode=USD&max=20`;
    if (returnDate) apiUrl += `&returnDate=${returnDate}`;
    if (children > 0) apiUrl += `&children=${children}`;
    if (infants > 0) apiUrl += `&infants=${infants}`;
    if (travelClass) apiUrl += `&travelClass=${travelClass}`;

    const flightRes = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await flightRes.json();

    results.innerHTML = "";

    if (!data.data || data.data.length === 0) {
      results.innerText = "No flights found.";
      return;
    }

    allFlights = data.data;
    displayFlights();
    submitSection.classList.remove('hidden');

  } catch (err) {
    console.error(err);
    results.innerHTML = 'Error fetching flights.';
  } finally {
    spinner.style.display = 'none';
  }
});

let allFlights = [];
let displayedFlights = 0;
let selectedFlights = [];
const showThisAmount = 5;

function displayFlights() {
  const seeMoreBtn = document.getElementById('seeMoreBtn');
  
  const flightsToShow = allFlights.slice(displayedFlights, displayedFlights + showThisAmount);
  
  flightsToShow.forEach((offer, i) => {
    const index = displayedFlights + i;
    const price = offer.price.total + ' ' + offer.price.currency;
    const itinerary = offer.itineraries[0];
    const segments = itinerary.segments;
    const totalDuration = itinerary.duration.replace('PT', '').toLowerCase();

    const firstFlight = segments[0];
    const lastFlight = segments[segments.length - 1];

    const flightInfo = segments.map(seg => `${seg.departure.iataCode} → ${seg.arrival.iataCode}`).join(', ');

    const div = document.createElement('div');
    div.classList.add('flight-option');
    div.setAttribute('index', index);

    div.innerHTML = `
      <input type="checkbox" id="flight${index}" class="flight-checkbox" index="${index}">
      <label for="flight${index}" class="flight-details">
        <div class="flight-header">
          <strong class="flight-number">${firstFlight.carrierCode} ${firstFlight.number}</strong>
          <span class="flight-price">${price}</span>
        </div>
        <div class="flight-info">
          <div class="flight-row">
            <strong>Route:</strong> ${flightInfo}
          </div>
          <div class="flight-row">
            <strong>Duration:</strong> ${totalDuration}
          </div>
          <div class="flight-row">
            <strong>Departure:</strong> ${new Date(firstFlight.departure.at).toLocaleString()}
          </div>
          <div class="flight-row">
            <strong>Arrival:</strong> ${new Date(lastFlight.arrival.at).toLocaleString()}
          </div>
        </div>
      </label>
    `;

    results.appendChild(div);
  });

  displayedFlights += flightsToShow.length;
  
  if (displayedFlights < allFlights.length) {
    seeMoreBtn.classList.remove('hidden');
  } else {
    seeMoreBtn.classList.add('hidden');
  }

  checkbox();
}

function checkbox() {
  const checkboxes = document.querySelectorAll(".flight-checkbox");
  const selectedCount = document.getElementById("selectedCount");
  const submitBtn = document.getElementById("submitSelectedFlights");

  checkboxes.forEach(check => {
    check.addEventListener("change", (event) => {
      const flightIndex = parseInt(event.target.getAttribute('index'));
      const flightDiv = document.querySelector(`[index="${flightIndex}"]`);
      
      if (event.target.checked) {
          selectedFlights.push(flightIndex);
          flightDiv.classList.add('selected');
      } else {
        let newSelectedFlights = [];
        for (let i = 0; i < selectedFlights.length; i++) {
          if (selectedFlights[i] !== flightIndex) {
              newSelectedFlights.push(selectedFlights[i]);
          }
        }
        selectedFlights = newSelectedFlights;
        flightDiv.classList.remove('selected');
      }
      const selected = selectedFlights.length;
      if (selected === 1) {
        selectedCount.textContent = selected + " flight selected";
      } else {
        selectedCount.textContent = selected + " flights selected";
      }

      if (selected > 0) {
        submitBtn.disabled = false;
      } else {
        submitBtn.disabled = true;
      }
    });
  });
}

document.getElementById('seeMoreBtn').addEventListener('click', function() {
  displayFlights();
});

document.getElementById('submitSelectedFlights').addEventListener('click', function() {
    if (selectedFlights.length === 0) {
        return;
    }
  
    let selectedFlightData = [];
    for (let i = 0; i < selectedFlights.length; i++) {
        let index = selectedFlights[i];
        selectedFlightData.push(allFlights[index]);
    }
    const confirmation = confirm(
        `confirm.`
    );
  
    if (!confirmation) {
        return;
    }
    const flight = selectedFlightData[0];
    const itinerary = flight.itineraries[0];
    const segments = itinerary.segments;
    let returnTime = null;
    if (segments.length > 1) {
    returnTime = segments[segments.length - 1].arrival.at;
    }
    const flightData  = {
        flightNumber: segments[0].carrierCode + segments[0].number,
        origin: segments[0].departure.iataCode,
        destination: segments[segments.length - 1].arrival.iataCode,
        departure: segments[0].departure.at,
        returnDate: returnTime,
        adults: parseInt(document.getElementById('adults').value),
        children: parseInt(document.getElementById('children').value),
        infants: parseInt(document.getElementById('infants').value),
        travelClass: document.getElementById('travelClass').value,
        cost: parseFloat(flight.price.total),
        duration: itinerary.duration
    };

    fetch("/flights", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            flightData : flightData 
        }),
    }).then(response => {
      response.json().then((body) => {
        console.log(response.status)
        console.log(body)
        if(response.status == 200){
            console.log("OK")
            location.assign("/mapv2?id=" + body.id)
        }else{
            console.log("BAD")
        }
        console.log(response);
      })
    });
});
let form = document.getElementById("flightsearch");
let results = document.getElementById("flightResults");

form.addEventListener("submit", (event) => {
    event.preventDefault();
    
    let from = document.getElementById("from").value;
    let to = document.getElementById("to").value;
    let when = document.getElementById("when").value;

    results.innerHTML = "Finding flights.";

    fetch(`/flights?from=${from}&to=${to}&date=${when}`)
        .then(response => 
            response.json())
        .then(data => {
            results.innerHTML = ""; 
            
            let allFlights = [];

            if (data.best_flights) {
                for (let i = 0; i < data.best_flights.length; i++) {
                    allFlights.push(data.best_flights[i]);
                }
            }

            if (data.other_flights) {
                for (let i = 0; i < data.other_flights.length; i++) {
                    allFlights.push(data.other_flights[i]);
                }
            }
            
            if (allFlights.length === 0) {
                results.innerText = "No flights found.";
                return;
            }

            allFlights.forEach((flight, i) => {
                let div = document.createElement("div");
                let firstFlight = flight.flights[0];
                let lastFlight = flight.flights[flight.flights.length - 1];
                
                let flightInfo = flight.flights.map(leg => 
                    `${leg.departure_airport.id} -> ${leg.arrival_airport.id}`
                ).join(" -> ");
                
                let price = `$${flight.price}`;
                let hours = Math.floor(flight.total_duration / 60);
                let minutes = flight.total_duration % 60;
                let duration = `${hours}hours ${minutes}minutes`;
                
                div.innerHTML = `
                    <input type="checkbox" id="flight${i}" class="me-2">
                    <label for="flight${i}">
                        <div>
                            <strong>Route:</strong> ${flightInfo}<br>
                            <strong>Price:</strong> ${price} two ways<br>
                            <strong>Total duration(wait times included):</strong> ${duration}<br>
                            <strong>Departure:</strong> ${firstFlight.departure_airport.time}<br>
                            <strong>Arrival:</strong> ${lastFlight.arrival_airport.time}<br>
                        </div>
                    </label>
                `;
                results.appendChild(div);
            });
        })
        .catch(error => {
            console.error("Error:", error);
            results.innerText = "Failed to get flights.";
        });
});
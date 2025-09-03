let params = new URL(document.location.toString()).searchParams;
let planId = params.get("id");
console.log(planId);

fetch("/get-plan?id=" + planId).then((response) => {
    response.json().then((body) => {
        let planNameLabel = document.getElementById("plan-name");
        planNameLabel.textContent = body['plan_name']
        
        console.log(body.flights);

        // Flight Cards
        if(body.flights.hasOwnProperty("flightData")){
            let flightInfo = body.flights.flightData;

            let flightDetailInclude = {"cost": "Flight Cost", "travelClass": "Travel Class", "flightNumber": "FlightNumber",
            "adults": "Adults", "infants": "Infants", "children": "Children"};
            
            document.getElementById("airport").textContent += flightInfo.origin;
            
            document.getElementById("startDate").textContent = flightInfo.departure;
            document.getElementById("endDate").textContent = flightInfo.returnDate;
            document.getElementById("destination").textContent = flightInfo.destination;
            
            let flightInfoCardRow1 = document.getElementById("flight-info-row-1");
            let flightInfoCardRow2 = document.getElementById("flight-info-row-2");

            let i = 0;
            for (var flightDetail in flightDetailInclude){
                let detailCol = document.createElement("div");
                detailCol.className = "col-md-4";


                let detailP = document.createElement("p");
                detailP.className = "card-text";

                if(flightInfo[flightDetail]){
                    detailP.textContent = flightDetailInclude[flightDetail] + ": " + flightInfo[flightDetail];
                }else{
                    detailP.textContent = flightDetailInclude[flightDetail] + ": N/A"
                }
        
                detailCol.appendChild(detailP);

                if (i < 3) {
                    flightInfoCardRow1.appendChild(detailCol);
                } else {
                    flightInfoCardRow2.appendChild(detailCol);
                }
                i++;
            }
        } else {
            console.log("WDADS")
            document.getElementById("airport").textContent = "A flight was not selected.";
        }

        // Hotel Cards
        if(body.hotels.hasOwnProperty("hotelData")){
            let hotelData = body.hotels.hotelData.data;
            let hotelContainer = document.getElementById("hotels");
            document.getElementById('hotels-amount').textContent += hotelData.hotels.length
            for (var key in hotelData.hotels){
                let hotel = hotelData.hotels[key];
                console.log(hotel)

                let hotelCard = document.createElement('div');
                hotelCard.className = "card";
            
                let divBody = document.createElement('div');
                divBody.className = "card-body";
                hotelCard.appendChild(divBody);
            
                let cardTitle = document.createElement("h5");
                cardTitle.className = "card-title";
                cardTitle.textContent = hotel.name;
                divBody.appendChild(cardTitle);
            
                let cardSubtitle = document.createElement("h6");
                cardSubtitle.className = "card-subtitle mb-2 text-muted";
                cardSubtitle.textContent = hotel.vicinity + "\r\n";
                cardSubtitle.textContent += "lat: " + hotel.coordinates.lat + ", long: " + hotel.coordinates.lng;
                cardSubtitle.setAttribute('style', 'white-space: pre;');
                divBody.appendChild(cardSubtitle);
            
                let cardText = document.createElement("p");
                cardText.className = "card-text";
                cardText.textContent = "Rating: " + hotel.rating + " stars out of " + hotel.user_ratings_total + " reviews"
                divBody.appendChild(cardText);
            
                hotelContainer.appendChild(hotelCard);
            }
        }else{
            document.getElementById("hotels-amount").textContent += "No Hotels were Selected"
        }
        
        let landMarks = body.landmarks;
        
        let landmarkContainer = document.getElementById("itinerary");
        console.log(landMarks.plan)

        for (var key in landMarks.plan){
            let landmark = landMarks.plan[key];
            console.log(landmark);
        
            let landmarkCard = document.createElement('div');
            landmarkCard.className = "card";
        
            let divBody = document.createElement('div');
            divBody.className = "card-body";
            landmarkCard.appendChild(divBody);
        
            let cardTitle = document.createElement("h5");
            cardTitle.className = "card-title";
            cardTitle.textContent = landmark.name;
            divBody.appendChild(cardTitle);
        
            let cardSubtitle = document.createElement("h6");
            cardSubtitle.className = "card-subtitle mb-2 text-muted";
            cardSubtitle.textContent = landmark.address + "\r\n";
            cardSubtitle.textContent += "lat: " + landmark.lat + ", long: " + landmark.lng;
            cardSubtitle.setAttribute('style', 'white-space: pre;');
            divBody.appendChild(cardSubtitle);
        
            let cardText = document.createElement("p");
            cardText.className = "card-text";
            cardText.textContent = landmark.notes;
            divBody.appendChild(cardText);
        
            // Google Map Link TODO
            let mapLink = document.createElement("a");
            mapLink.textContent = "Google Maps Link";
            mapLink.href = "https://www.google.com/maps";
            divBody.appendChild(mapLink);
        
            landmarkContainer.appendChild(landmarkCard);
        }
    })
}).catch((error) => {
    console.log(error);
})
// let flightInfo = {"cost": 302.6, 
// "adults": 1, 
// "origin": "ATL", 
// "infants": 0, 
// "children": 0, 
// "duration": "PT10H50M", 
// "departure": "2025-08-17T13:33:00", 
// "returnDate": "2025-08-17T23:23:00", 
// "destination": "AUS", 
// "travelClass": "", 
// "flightNumber": "F93293"
// }

// let flightInfoCard = document.getElementById("flight-info")

// let doNotInclude = ["origin", "departure", "duration", "returnDate", "destination"]

// document.getElementById("airport").textContent += flightInfo.origin;

// document.getElementById("startDate").textContent = flightInfo.departure;
// document.getElementById("endDate").textContent = flightInfo.returnDate;
// document.getElementById("destination").textContent = flightInfo.destination;

// for (var flightDetail in flightInfo){
//     if(!doNotInclude.includes(flightDetail)){
//         console.log(flightDetail);
//         let detailP = document.createElement("p");
//         detailP.className = "card-text";
//         detailP.textContent = flightDetail + ": " + flightInfo[flightDetail];

//         flightInfoCard.appendChild(detailP);
//     }
// }

// //<p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>


// let landMarks = {
//     0 : {
//         address: "Hodges Heights Park, 7063 Creek Crossing Dr, Harrisburg, PA 17111, USA",
//         lat: 40.276714,
//         lng: -76.763919,
//         name: "",
//         notes: "First Visit, beautiful park",
//     },
//     1: { 
//         address: "City Island (North Side Shelter), Harrisburg, PA 17101, USA",
//         lat: 40.254148,
//         lng: -76.887349,
//         name: "",
//         notes: "Example asfsafaslshfkfhsdfasdasdjdhfsfhskfh",
//     }, 
//     3: {
//         address: "411 Gravel Rd, Palmyra, PA 17078, USA",
//         lat: 40.319828,
//         lng: -76.620112,
//         name: "",
//         notes: "Visiting Pennsylvania street and getting some cheesesteaks",
//     }
// }

// let landmarkContainer = document.getElementById("itinerary");

// for (var key in landMarks){
//     let landmark = landMarks[key];
//     console.log(landmark);

//     let landmarkCard = document.createElement('div');
//     landmarkCard.className = "card";

//     let divBody = document.createElement('div');
//     divBody.className = "card-body";
//     landmarkCard.appendChild(divBody);

//     let cardTitle = document.createElement("h5");
//     cardTitle.className = "card-title";
//     cardTitle.textContent = landmark.address;
//     divBody.appendChild(cardTitle);

//     let cardSubtitle = document.createElement("h6");
//     cardSubtitle.className = "card-subtitle mb-2 text-muted";
//     cardSubtitle.textContent = "lat: " + landmark.lat + ", long: " + landmark.lng;
//     divBody.appendChild(cardSubtitle);

//     let cardText = document.createElement("p");
//     cardText.className = "card-text";
//     cardText.textContent = landmark.notes;
//     divBody.appendChild(cardText);

//     // Google Map Link TODO
//     let mapLink = document.createElement("a");
//     mapLink.textContent = "Google Maps Link";
//     mapLink.href = "https://www.google.com/maps";
//     divBody.appendChild(mapLink);

//     landmarkContainer.appendChild(landmarkCard);
// }
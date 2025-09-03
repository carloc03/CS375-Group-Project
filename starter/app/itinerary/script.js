let params = new URL(document.location.toString()).searchParams;
let planId = params.get("id");
console.log(planId);

fetch("/get-plan?id=" + planId).then((response) => {
    response.json().then((body) => {
        let flightInfo = body.flights.flightData;
        
        let flightInfoCard = document.getElementById("flight-info")
        
        let doNotInclude = ["origin", "departure", "duration", "returnDate", "destination"]
        
        document.getElementById("airport").textContent += flightInfo.origin;
        
        document.getElementById("startDate").textContent = flightInfo.departure;
        document.getElementById("endDate").textContent = flightInfo.returnDate;
        document.getElementById("destination").textContent = flightInfo.destination;
        
        for (var flightDetail in flightInfo){
            if(!doNotInclude.includes(flightDetail)){
                console.log(flightDetail);
                let detailP = document.createElement("p");
                detailP.className = "card-text";
                detailP.textContent = flightDetail + ": " + flightInfo[flightDetail];
        
                flightInfoCard.appendChild(detailP);
            }
        }
        
        //<p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
        
        
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
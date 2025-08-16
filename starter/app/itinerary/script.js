let params = new URL(document.location.toString()).searchParams;
let planId = params.get("id");
console.log(planId);
let landMarks = {
    0 : {
        address: "R4PH+8X Čestín, Czechia",
        lat: 49.835768,
        lng: 15.129997,
        name: "",
        notes: "First Visit, beautiful city",
    },
    1: { 
        address: "GGVW+92 Stetseva, Ivano-Frankivsk Oblast, Ukraine",
        lat: 48.543432,
        lng: 25.545036,
        name: "",
        notes: "Ukraine Example asfsafaslshfkfhsdfasdasdjdhfsfhskfh",
    }
}

let landmarkContainer = document.getElementById("itinerary");

for (var key in landMarks){
    let landmark = landMarks[key];
    console.log(landmark);

    let landmarkCard = document.createElement('div');
    landmarkCard.className = "card";

    let divBody = document.createElement('div');
    divBody.className = "card-body";
    landmarkCard.appendChild(divBody);

    let cardTitle = document.createElement("h5");
    cardTitle.className = "card-title";
    cardTitle.textContent = landmark.address;
    divBody.appendChild(cardTitle);

    let cardSubtitle = document.createElement("h6");
    cardSubtitle.className = "card-subtitle mb-2 text-muted";
    cardSubtitle.textContent = "lat: " + landmark.lat + ", long: " + landmark.lng;
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
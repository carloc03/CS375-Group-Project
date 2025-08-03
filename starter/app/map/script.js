// THIS IS A SIMPLE UI TESTING IMPLEMENTATION ONLY, 
// IT'S NOT HOOKED UP TO SERVER-SIDE AND DB YET.
let map, geocoder, infoWindow;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 40.7128, lng: -74.0060 }, // Default: New York
    zoom: 5
  });

  geocoder = new google.maps.Geocoder();
  infoWindow = new google.maps.InfoWindow();

  map.addListener("click", (e) => {
    const container = document.createElement("div");
    container.className = "info-window";

    const title = document.createElement("div");
    title.textContent = "Add this location?";
    container.appendChild(title);

    const btn = document.createElement("button");
    btn.textContent = "Add to Plan";
    btn.className = "add-btn";
    btn.onclick = () => addToPlan(e.latLng);
    container.appendChild(btn);

    infoWindow.setContent(container);
    infoWindow.setPosition(e.latLng);
    infoWindow.open(map);
  });
}

function addToPlan(latLng) {
  infoWindow.close();

  geocoder.geocode({ location: latLng }, (results, status) => {
    let name = "Unknown location";
    if (status === "OK" && results[0]) {
      name = results[0].formatted_address;
    }
    const li = document.createElement("li");
    li.textContent = `${name} (Lat: ${latLng.lat().toFixed(5)}, Lng: ${latLng.lng().toFixed(5)})`;
    document.getElementById("planList").appendChild(li);
  });
}
// planCreation/script.js
// Validates the form, stores the basics, and redirects to the first checked section
// in the required order: Flights -> Hotels -> Landmarks

(function () {
    const form = document.getElementById('planForm');
    const planNameEl = document.getElementById('planName');
    const destEl = document.getElementById('destination');
    /*
    const flightsEl = document.getElementById('includeFlights');
    const hotelsEl = document.getElementById('includeHotels');
    const landmarksEl = document.getElementById('includeLandmarks');
    const checklistHelp = document.getElementById('checklistHelp');
  
    // Use absolute server routes (as defined in server.js)
    const PATHS = { flights: '/search-flights/index.html', hotels: '/hotels/', landmarks: '/mapV2/' };

  
    function persistBasics() {
      try {
        const payload = {
          planName: planNameEl.value.trim(),
          destination: destEl.value.trim(),
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('currentPlan', JSON.stringify(payload));
      } catch (_) {}
    }
  
    function atLeastOneChecked() {
      return flightsEl.checked || hotelsEl.checked || landmarksEl.checked;
    }
  
    function firstCheckedPathInOrder() {
      if (flightsEl.checked) return PATHS.flights;
      if (hotelsEl.checked) return PATHS.hotels;
      if (landmarksEl.checked) return PATHS.landmarks;
      return null;
    }
  
    function showChecklistError(show) {
      checklistHelp.style.display = show ? 'block' : 'none';
    }
  */
    form.addEventListener('submit', function (e) {
      // native constraint validation
      if (!form.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
        form.classList.add('was-validated');
        return;
      }
      /*
      // group rule
      if (!atLeastOneChecked()) {
        e.preventDefault();
        e.stopPropagation();
        showChecklistError(true);
        return;
      }*/
  
      // ok to proceed
      e.preventDefault();
      //showChecklistError(false);
      //persistBasics();
      fetch("/make-plan", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            planName: planNameEl.value,
            planDestination: destEl.value
        }),
      }).then(response => {
        response.json().then((body) => {
          console.log(response.status)
          console.log(body)
          if(response.status == 200){
              console.log("OK")
              location.assign("/search-flights?id=" + body.id);
          }else{
              console.log("BAD")
          }
          console.log(response);
        })
      });
    });
  
    /*[flightsEl, hotelsEl, landmarksEl].forEach(cb => {
      cb.addEventListener('change', () => showChecklistError(!atLeastOneChecked()));
    });*/
  })();
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('inputEmail');
    const pw = document.getElementById('password');
    const msg = document.getElementById('message-box');
    msg.textContent = '';
    msg.className = 'mt-2 text-center';

    if (!email.value || !pw.value) {
      msg.textContent = 'Please enter both email and password.';
      msg.classList.add('text-danger');
      return;
    }

    console.log(email.value);
    console.log(password.value);
    fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email.value,
            passwordAttempt: password.value
        }),
    }).then(response => {
        console.log(response.status)
        if(response.status == 200){
            console.log("OK")

            //Send user to logged in home page
            location.assign('/home')
        }else{
            console.log("BAD")
            msg.textContent = "Could Not Find Account"
            msg.classList.add('text-danger');
        }
        console.log(response);
    })
  });
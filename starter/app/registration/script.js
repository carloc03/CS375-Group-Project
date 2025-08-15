let submitButton = document.getElementById("submit");
submitButton.addEventListener("click", () => {
    let messageBox = document.getElementById("message-box")
    messageBox.textContent = "";

    let firstName = document.getElementById("firstName").value;
    let lastName = document.getElementById("lastName").value;
    let email = document.getElementById("inputEmail").value;
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirmPassword").value;
    
    if(!firstName || !lastName || !email || !password || !confirmPassword){
        messageBox.textContent = "Information is missing."
    }else if(!(password == confirmPassword)){
        messageBox.textContent = "Password do not match."
    }else{
        //send acc creation info to server
        fetch("/create-account", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password
            }),
        }).then(response => {
            console.log(response.status)
            if(response.status == 200){
                console.log("OK")
                messageBox.textContent = "Account Created."
                fetch("/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email,
                        passwordAttempt: password
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
            }else{
                console.log("BAD")
            }
            console.log(response);
        })
    }
})
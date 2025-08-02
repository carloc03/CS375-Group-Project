let submitButton = document.getElementById("submit");
submitButton.addEventListener("click", () => {
    let messageBox = document.getElementById("message-box")
    messageBox.textContent = "";

    let firstName = document.getElementById("firstName").value;
    let lastName = document.getElementById("lastName").value;
    let email = document.getElementById("inputEmail").value;
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirmPassword").value;
    console.log(firstName);
    console.log(lastName);
    console.log(email);
    console.log(password);
    console.log(confirmPassword);
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
            }else{
                console.log("BAD")
            }
            console.log(response);
        })
    }
})
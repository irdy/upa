document.addEventListener("DOMContentLoaded", async () => {

    console.log('dom loaded successfully!');

    function setHeading() {
        const titleNode = document.querySelector("#heading");
        titleNode.innerHTML += ' ' + (new Date()).toLocaleDateString();
    }

    setHeading();

    async function makeRequest() {
        // try catch??
        const resp = await fetch('/getData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                payload: 'some_payload_from_client'
            })
        })

        return resp.json();
    }

    function printIntoConsole(str, stringify= true) {
        const consoleNode = document.querySelector('#console');
        consoleNode.innerHTML = JSON.stringify(str, null, 2);
    }

    document.querySelector("#make_req_btn").addEventListener('click', async () => {
        console.log("click handler invoked!");
        try {
            const data = await makeRequest();
            console.log(data);
            printIntoConsole(data);
        } catch (err) {
            throw err;
        }
    })

});
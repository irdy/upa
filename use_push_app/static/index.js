'use strict';

document.addEventListener("DOMContentLoaded", async () => {

    let $ = document.querySelector.bind(document);

    console.log('dom loaded successfully!');

    function setHeading() {
        const titleNode = document.querySelector("#heading");
        titleNode.innerHTML += ' ' + (new Date()).toLocaleDateString();
    }

    setHeading();

    async function makeJSONRequest(endpoint, data) {
        // try catch??
        const resp = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

        return resp.json();
    }

    function printIntoConsole(str, stringify = true, consoleLogged = true) {
        const consoleNode = document.querySelector('#console');
        consoleNode.innerHTML = JSON.stringify(str, null, 2);
        if (consoleLogged) {
            console.log(str);
        }
    }

    document.querySelector("#make_req_btn").addEventListener('click', async () => {
        console.log("click handler invoked!");
        try {
            const data = await makeJSONRequest('/getData', {
                payload: 'some_payload_from_client'
            });
            console.log(data);
            printIntoConsole(data);
        } catch (err) {
            throw err;
        }
    });

    document.forms.namedItem("create_user").addEventListener('submit', async e => {
        e.preventDefault();
        console.log(e.target);

        const formData = new FormData(e.target);
        const HTTP_method = formData.get('actions').toUpperCase();
        const user_id = formData.get('user_id');
        formData.delete('actions');
        formData.delete('user_id');

        const APPLICATION_JSON = 'application/json';

        const REQUESTS = {
            'POST': () => fetch('api/users', {
                method: HTTP_method,
                body: formData
            }),
            'PUT': () => fetch(`api/users/${user_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': APPLICATION_JSON
                }
            }),
            'DELETE': () => fetch(`api/users/${user_id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': APPLICATION_JSON
                }
            }),
            'PATCH': () => fetch(`api/users/${user_id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': APPLICATION_JSON
                },
                // convention of restriction: only password may be changed
                body: JSON.stringify({
                    // username: 'haha', // if username is included server will respond with 400
                    password: formData.get("password"),
                })
            })
        }

        console.log("method", HTTP_method);

        const response = await REQUESTS[HTTP_method]();
        let data = Promise.resolve(null);
        if (response.headers.get('content-type') === APPLICATION_JSON) {
            data = await response.json();
        }

        printIntoConsole(data)
    }, false);

});

'use strict';

document.addEventListener("DOMContentLoaded", async () => {

    let $ = document.querySelector.bind(document);

    console.log('dom loaded successfully!');

    function setHeading() {
        const titleNode = document.querySelector("#heading");
        titleNode.innerHTML += ' ' + (new Date()).toLocaleDateString();
    }

    setHeading();


    function printIntoConsole(str, stringify = true, consoleLogged = true) {
        const consoleNode = document.querySelector('#console');
        consoleNode.innerHTML = JSON.stringify(str, null, 2);
        if (consoleLogged) {
            console.log(str);
        }
    }

    document.forms.namedItem("create_user").addEventListener('submit', async e => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const HTTP_method = formData.get('actions').toUpperCase();
        const user_id = formData.get('user_id');
        formData.delete('actions');
        formData.delete('user_id');

        console.log(JSON.stringify(Object.fromEntries(formData)))

        const REQUESTS = {
            'POST': () => Utils.makeJSONRequest('api/users', {
                method: 'POST',
                body: JSON.stringify({
                    payload: Object.fromEntries(formData)
                })
            }),
            'DELETE': () => Utils.makeJSONRequest(`api/users/${user_id}`, {
                method: 'DELETE'
            }),
            'PATCH': () => Utils.makeJSONRequest(`api/users/${user_id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    payload: {
                        password: formData.get("password"),
                    }
                })
            })
        }


        const data = await REQUESTS[HTTP_method]();
        printIntoConsole(data);
    }, false);

});

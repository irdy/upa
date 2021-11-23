'use strict';

function saveToken(token) {
    console.log('token saved to store', token);
    localStorage.setItem("token", token);
}

document.addEventListener("DOMContentLoaded", async () => {

    const pathname = new URL(document.location).pathname;

    document.forms.namedItem("auth").addEventListener('submit', async e => {
        e.preventDefault();


        const formData = new FormData(e.target);
        const payload = Object.fromEntries(formData);

        const data = await Utils.makeJSONRequest(`/api/auth${pathname}`, {
            method: 'POST',
            body: JSON.stringify({
                payload: payload
            })
        });

        console.log("response data", data);
        if (!data?.data) return;
        const { access_token } = data?.data;
        const token = Utils.parseToken(access_token);
        saveToken(token);

    });

    document.querySelector(".refresh_token").addEventListener('click', async e => {
        const data = await Utils.makeJSONRequest('/api/auth/refresh_tokens', {
            method: 'POST',
        });

        console.log("response data", data)
        if (!data?.data) return;
        const { access_token } = data.data;
        const token = Utils.parseToken(access_token);
        saveToken(token);

    });

    document.querySelector(".sign_out").addEventListener("click", async e => {
        const data = await Utils.makeJSONRequest('/api/auth/sign_out', {
            method: 'POST',
        });
    });

});


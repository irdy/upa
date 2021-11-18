'use strict'

const public_paths = [
    '/sign_in',
    '/sign_up',
    '/api/auth/sign_in',
    '/api/auth/sign_up',
    // '/api/auth/sign_out',
    '/api/auth/refresh_tokens',
    '/sandbox'
]

class Utils {
    static async makeJSONRequest(endpoint, requestInit = {}) {
        console.log("endpoint", endpoint);

        const ACCESS_TOKEN = localStorage.getItem("token");

        if (!requestInit.headers) {
            requestInit.headers = Object.create(null)
        }

        if (!public_paths.includes(endpoint) && ACCESS_TOKEN) {
            requestInit.headers['Authorization'] = `Bearer ${ACCESS_TOKEN}`
        }

        if (!requestInit.headers['Content-Type']) {
            requestInit.headers['Content-Type'] = 'application/json'
        }

        // todo ? for each request?
        if (!requestInit.headers['X-UUID']) {
            // <empty_string> == Browser_Environment
            requestInit.headers['X-UUID'] = ''
        }

        const resp = await fetch(endpoint, requestInit)

        return resp.json();
    }

    static parseToken(accessToken) {
        if (!accessToken) {
            throw Error('Token not found')
        }

        const regexp = /Bearer\s([^.]+\.[^.]+\.[^.]+)/;
        const matched = accessToken.match(regexp);
        if (matched === null) {
           throw Error("Invalid Token");
        }

        const [_, token] = matched;
        return token
    }

}

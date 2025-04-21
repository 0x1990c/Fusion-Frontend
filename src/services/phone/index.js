const API = import.meta.env.VITE_API_URL

export const getPhones = async () => {
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API + 'phone-table', {
            headers: {
                authorization: `Bearer ${token}`
            }
        });
        
        const json = await res.json();
        if (json && json.detail === "Could not validate credentials") {
            localStorage.removeItem('access_token');
        }
        return json;
    } catch (error) {
        console.log(error);
    }
}

export const addPhone = async (payload) => {
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API + 'add-phone', {
            method: 'POST',
            headers: {
                authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const json = await res.json();
        if (json.detail === "Could not validate credentials") {
            localStorage.removeItem('access_token');
        }
        return json;
    } catch (error) {
        console.log(error);
    }
}

export const updatePhone = async (phone_id, payload) => {
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API + `update-phone?phone_id=${phone_id}`, {
            method: 'POST',
            headers: {
                authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const json = await res.json();
        if (json.detail === "Could not validate credentials") {
            localStorage.removeItem('access_token');
        }
        return json;
    } catch (error) {
        console.log(error);
    }
}

export const deletePhone = async (phone_id) => {
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API + `delete-phone?phone_id=${phone_id}`, {
            headers: {
                authorization: `Bearer ${token}`
            }
        });

        const json = await res.json();
        if (json.detail === "Could not validate credentials") {
            localStorage.removeItem('access_token');
        }
        return json;
    } catch (error) {
        console.log(error);
    }
}

export const getPhonesByCustomer = async (customer_id) => {
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API + `customer-phones?customer_id=${customer_id}`, {
            headers: {
                authorization: `Bearer ${token}`
            }
        });
        
        const json = await res.json();
        if (json.detail === "Could not validate credentials") {
            localStorage.removeItem('access_token');
        }
        return json;
    } catch (error) {
        console.log(error);
    }
}

export const sendOptinMessages = async (phones) => {
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API + 'send-optin-messages', {
            method: 'POST',
            headers: {
                authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(phones)
        });

        const json = await res.json();
        if (json.detail === "Could not validate credentials") {
            localStorage.removeItem('access_token');
        }
        return json;
    } catch (error) {
        console.log(error);
    }
}

export const getOptinMessage = async () => {
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API + 'get-optin-message', {
            headers: {
                authorization: `Bearer ${token}`
            }
        });
        
        const json = await res.json();
        if (json.detail === "Could not validate credentials") {
            localStorage.removeItem('access_token');
        }
        return json;
    } catch (error) {
        console.log(error);
    }
}

export const updateOptinMessage = async (payload) => {
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API + 'update-optin-message', {
            method: 'POST',
            headers: {
                authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const json = await res.json();
        if (json.detail === "Could not validate credentials") {
            localStorage.removeItem('access_token');
        }
        return json;
    } catch (error) {
        console.log(error);
    }
}





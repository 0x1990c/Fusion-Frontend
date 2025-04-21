const API = import.meta.env.VITE_API_URL

export const getClients = async () => {
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API+`customer-table`, {
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        const json = await res.json();
        if (json && json.detail === "Could not validate credentials") {
            localStorage.removeItem('access_token')
        }
        return json;
    } catch (error) {
        console.log(error)
    }
}

export const addClient = async (payload) => {
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API+`add-customer`, {
            method: 'POST',
            headers: {
                authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        })

        const json = await res.json();
        if (json.detail === "Could not validate credentials") {
            localStorage.removeItem('access_token')
        }
        return json;
    } catch (error) {
        console.log(error)
    }
}

export const updateClient = async (payload, customer_id) => {
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API+`update-customer?customer_id=${customer_id}`, {
            method: 'POST',
            headers: {
                authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        })

        const json = await res.json();
        if (json.detail === "Could not validate credentials") {
            localStorage.removeItem('access_token')
        }
        return json;
    } catch (error) {
        console.log(error)
    }
}

export const deleteClient = async (customer_id) => {
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API+`delete-customer?customer_id=${customer_id}`, {
            headers: {
                authorization: `Bearer ${token}`
            }
        })

        const json = await res.json();
        if (json.detail === "Could not validate credentials") {
            localStorage.removeItem('access_token')
        }
        return json;
    } catch (error) {
        console.log(error)
    }
}

export const getCustomerCategories = async () => {
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API + 'customer-categories', {
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

export const addCustomerCategory = async (payload) => {
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API + 'add-customer-category', {
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

export const updateCustomerCategory = async (payload) => {

    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API + 'update-customer-category', {
            method: 'POST',
            headers: {
                authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        })

        const json = await res.json();
        if (json.detail === "Could not validate credentials") {
            localStorage.removeItem('access_token')
        }
        return json;
    } catch (error) {
        console.log(error)
    }
}

export const deleteCustomerCategories = async (payload) => {

    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API + 'delete-customer-categories', {
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

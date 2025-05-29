const API = import.meta.env.VITE_API_URL

export const getCases =  async (data) => {
        
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API+`getCases`, {
            method: 'POST',
            headers: {
                authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
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

export const getData =  async (data) => {
        
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API+`getData`, {
            method: 'POST',
            headers: {
                authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
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

export const getDataForMerge =  async (data) => {
        
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API+`getDataForMerge`, {
            method: 'POST',
            headers: {
                authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
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

export const getCounties =  async (data) => {
        
    try {

        const token = localStorage.getItem('access_token') || '';

        console.log(token);
        
        const res = await fetch(API+`getCounties`, {
            method: 'POST',
            headers: {
                authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
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

export const getLastQueryDate =  async () => {
        
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API+`getLastQueryDate`, {
            method: 'POST',
            headers: {
                authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: ""
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

export const getCourts =  async () => {
        
    try {
        const token = localStorage.getItem('access_token') || '';
        
        const res = await fetch(API+`getCourts`, {
            method: 'POST',
            headers: {
                authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify('')
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

export const fetchCourts =  async () => {
        
    try {

        const token = localStorage.getItem('access_token') || '';

        console.log(token);
        
        const res = await fetch(API+`fetchCourts`, {
            method: 'POST',
            headers: {
                authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify('')
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

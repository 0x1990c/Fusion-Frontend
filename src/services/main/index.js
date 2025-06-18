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

export const getSavedTemplates =  async (data) => {
        
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API+`getSavedTemplates`, {
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

export const getPaidCourts =  async (data) => {
        
    try {
        const token = localStorage.getItem('access_token') || '';
        
        const res = await fetch(API+`getPaidCourts`, {
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

export const getPaidCounty =  async (data) => {
        
    try {
        const token = localStorage.getItem('access_token') || '';
        
        const res = await fetch(API+`getPaidCounty`, {
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



export const getIndianaCounties =  async () => {
        
    try {
        const token = localStorage.getItem('access_token') || '';
        
        const res = await fetch(API+`getIndianaCounties`, {
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

export const fetchCounties =  async () => {
        
    try {

        const token = localStorage.getItem('access_token') || '';

        const res = await fetch(API+`fetchCounties`, {
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

export const alertCourtsToAdmin =  async (data) => {
        
    try {

        const token = localStorage.getItem('access_token') || '';

        const res = await fetch(API+`alertCourtsToAdmin`, {
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

export const uploadTemplates = async(data) =>{

    try {

        const token = localStorage.getItem('access_token') || '';

        const res = await fetch(API+`upload`, {
            method: 'POST',
            headers: {
                authorization: `Bearer ${token}`,
            },
            body: data
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

export const getSavedShortcode =  async () => {
        
    try {

        const token = localStorage.getItem('access_token') || '';

        const res = await fetch(API+`getSavedShortcode`, {
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

export const getFields =  async () => {
        
    try {

        const token = localStorage.getItem('access_token') || '';

        const res = await fetch(API+`getFields`, {
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

export const addNewShortcode =  async (data) => {
        
    try {

        const token = localStorage.getItem('access_token') || '';

        const res = await fetch(API+`addNewShortcode`, {
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


export const removeShortcode =  async (data) => {
        
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API+`removeShortcode`, {
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


export const removeSavedTemplate =  async (data) => {
        
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API+`removeSavedTemplate`, {
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


export const getTemplateContent =  async (data) => {
        
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API+`getTemplateContent`, {
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

export const getCompletedTemplate =  async (data) => {
        
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API+`getCompletedTemplate`, {
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

export const getPurchasedCourts =  async () => {
        
    try {
        const token = localStorage.getItem('access_token') || '';
        
        const res = await fetch(API+`getPurchasedCourts`, {
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


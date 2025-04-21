const API = import.meta.env.VITE_STRIPE_URL


export const checkout =  async (data) => {
        
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API+`checkout`, {
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


export const getBalance = async () => {
    const token = localStorage.getItem('access_token') || '';
    const res = await fetch(API+`balance`, {
        headers: {
            authorization: `Bearer ${token}`
        }
    })
    const json = await res.json();
    return json;
}
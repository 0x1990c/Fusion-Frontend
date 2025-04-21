const API = import.meta.env.VITE_API_URL

export const sendSms = async (message_id) => {
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API+`send?message_id=${message_id}`, {
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
        console.log(error)
    }
}

export const getMessages = async () => {
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API + `message-table`, {
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
        console.log(error)
    }
}

export const deleteMessage = async (message_id) => {
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API + `delete-message?message_id=${message_id}`, {
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
        console.log(error)
    }
}

export const addMessage = async (data) => {
    try {
        const token = localStorage.getItem('access_token') || '';

        const res = await fetch(API + 'add-message', {
            method: 'POST',
            headers: {
                authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                last_message: data.last_message,
                qued_timestamp: data.qued_timestamp,
                categories: data.categories,
                phone_numbers: data.phone_numbers,
                user_email : data.user_email,
                created_at: new Date().toISOString()
            })
        });
        const json = await res.json();
        if (json.detail === "Could not validate credentials") {
            localStorage.removeItem('access_token');
        }
        return json;
    } catch (error) {
        console.log(error)
    }
}

export const updateMessage = async (messageId, messageData) => {
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API +`update-message?message_id=${messageId}`, {
            method: 'POST',
            headers: {
                authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(messageData)
        });
        const json = await res.json();
        if (json.detail === "Could not validate credentials") {
            localStorage.removeItem('access_token');
        }
        return json;    
    } catch (error) {
        console.error('Error updating message:', error);
        return null;
    }
};


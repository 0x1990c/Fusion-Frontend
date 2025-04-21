const API = import.meta.env.VITE_API_URL

// Fetch Notification Table data
export const getNotifications = async () => {
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API+`customer-table`, {
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

export const getTimer = async() =>{
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API+'timer', {
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

/* ---------------Project--------------- */
// Set Qued Status for the row
export const setQued = async (project_id) => {
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API+`qued?project_id=${project_id}`, {
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        const json = await res.json();
        return json;
    } catch (error) {
        console.log(error)
    }
}

// Remove Qued Status for the row
export const cancelQued = async (project_id) => {
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API+`cancel-qued?project_id=${project_id}`, {
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        const json = await res.json();
        return json;
    } catch (error) {
        console.log(error)
    }
}

// Remove Qued Status for the row
export const setSent = async (project_id) => {
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API+`set-sent?project_id=${project_id}`, {
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        const json = await res.json();
        return json;
    } catch (error) {
        console.log(error)
    }
}


// Update Last Message for the row (Use case: Delete Message, Edit Message)
export const updateLastMessage = async (project_id, message) => {
    console.log("------project_id---", project_id);

    const last_message = {
        "project_id": project_id,
        "message": message
    }
    console.log("---------", last_message);
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API+`update-last-message`, {
            method: 'POST', // Use POST method to send data
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(last_message) // Convert the variables object to a JSON string
        })
        const json = await res.json();
        return json;
    } catch (error) {
        console.log(error)
    }
}

// Download project messages
export const downloadProjectMessage = async (project_id) => {
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API+`download-project-message?project_id=${project_id}`, {
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'message.txt'; // or any other extension
        document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
        a.click();

        return true;
    } catch (error) {
        console.log(error)
    }
}

// Delete project
export const deleteProject = async (project_id) => {
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API+`delete-project?project_id=${project_id}`, {
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        
        return true;
    } catch (error) {
        console.log(error)
    }
}


/* ---------------Customer--------------- */
// Download customer messages
export const downloadCustomerMessage = async (customer_id) => {
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API+`download-customer-message?customer_id=${customer_id}`, {
            headers: {
                authorization: `Bearer ${token}`
            }
        })

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'message.txt'; // or any other extension
        document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
        a.click();

        return true;
    } catch (error) {
        console.log(error)
    }
}
/* ---------------History--------------- */
// Download history messages
export const downloadHistoryMessage = async (history_id) => {
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API+`download-history-message?history_id=${history_id}`, {
            headers: {
                authorization: `Bearer ${token}`
            }
        })

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'message.txt'; // or any other extension
        document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
        a.click();

        return true;
    } catch (error) {
        console.log(error)
    }
}



// Change automatic send status for customer
export const changeCustomerStatus = async (customer_id, method) => {
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API+`change-status?customer_id=${customer_id}&method=${method}`, {
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        const json = await res.json();
        return json;
    } catch (error) {
        console.log(error)
    }
}

// Delete customer
export const deleteCustomer = async (customer_id) => {
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API+`delete-customer?customer_id=${customer_id}`, {
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        const json = await res.json();
        return json;
    } catch (error) {
        console.log(error)
    }
}

// update all last messages
export const rerunChatGPT = async () => {
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API+`rerun-chatgpt`, {
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        const json = await res.json();
        return json;
    } catch (error) {
        console.log(error)
    }
}

export const getNewProjects = async (source) => {
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API+`update-db?source=${source}`, {
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        const json = await res.json();
        return json;
    } catch (error) {
        console.log(error)
    }
}

// Set settings variable
export const setVariables = async (variables) => {
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API + 'set-variables', { // Assuming 'set-variables' is the endpoint for setting variables
            method: 'POST', // Use POST method to send data
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(variables) // Convert the variables object to a JSON string
        });
        const json = await res.json();
        return json;
    } catch (error) {
        console.error(error);
        return null; // Return null or handle the error as needed
    }
}

export const getVariables = async () => {
    try {
        const token = localStorage.getItem('access_token') || '';
        return fetch(API + 'variables', { // Assuming 'set-variables' is the endpoint for setting variables
            method: 'GET', // Use POST method to send data
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error(error);
        return null; // Return null or handle the error as needed
    }
}

export const checkMainTableUpdate = async () => {
    try {
        const token = localStorage.getItem('access_token') || '';
        return fetch(API + 'check-database-update', { // Assuming 'set-variables' is the endpoint for setting variables
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error(error);
        return null; // Return null or handle the error as needed
    }
}

export const checkScrapingStatus = async () => {
    try {
        const token = localStorage.getItem('access_token') || '';
        return fetch(API + 'check-scraping-status', { // Assuming 'set-variables' is the endpoint for setting variables
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error(error);
        return null; // Return null or handle the error as needed
    }
}

export const sendOptInEmail = async (customer_id, opt_in_status_email) => {
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API + `set-opt-in-status-email?customer_id=${customer_id}&opt_in_status_email=${opt_in_status_email}`, { // Assuming 'set-variables' is the endpoint for setting variables
            method: 'GET', // Use POST method to send data
            headers: {
                'Content-Type': 'application/json', // Indicate that we're sending JSON data
                'Authorization': `Bearer ${token}`
            }
        });
        const json = await res.json();
        return json;
    } catch (error) {
        console.error(error);
        return null; // Return null or handle the error as needed
    }
}

export const sendOptInPhone = async (customer_id, opt_in_status_phone) => {
    try {
        const token = localStorage.getItem('access_token') || '';
        const res = await fetch(API + `set-opt-in-status-phone?customer_id=${customer_id}&opt_in_status_phone=${opt_in_status_phone}`, { // Assuming 'set-variables' is the endpoint for setting variables
            method: 'GET', // Use POST method to send data
            headers: {
                'Content-Type': 'application/json', // Indicate that we're sending JSON data
                'Authorization': `Bearer ${token}`
            }
        });
        const json = await res.json();
        return json;
    } catch (error) {
        console.error(error);
        return null; // Return null or handle the error as needed
    }
}
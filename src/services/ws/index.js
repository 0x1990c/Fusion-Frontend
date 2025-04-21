const API_MESSAGE = import.meta.env.VITE_WS_URL_MESSAGE
const API_PHONE = import.meta.env.VITE_WS_URL_PHONE

export class WebSocketManager_Phone {
    socket;
    fns;

    constructor() {
        this.socket = new WebSocket(API_PHONE);
        this.fns = {}

        this.socket.addEventListener("message", event => {
            const data = JSON.parse(event.data)
            console.log("Message from phone server: ", data)
            if (this.fns[data.type]) {
                this.fns[data.type].forEach((item) => {
                    item.cb(data.data)
                })
            }
        });
    }

    addFns(key, cb, id) {
        if (this.fns[key]) {
            this.fns[key].push({ id, cb })
        } else {
            this.fns[key] = [{ id, cb }]
        }
    }

    removeFns(key, id) {
        if (this.fns[key]) {
            this.fns[key] = this.fns[key].filter((fn) => fn.id !== id)
        }
    }

    getSocket() {
        return this.socket;
    }

    closeSocket() {
        this.socket.close();
    }
}
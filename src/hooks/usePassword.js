import { useState } from "react";

export const usePassword = () => {
    const [show, setShow] = useState(false);

    const showPassword = () => setShow(true);
    const hidePassword = () => setShow(false);

    return [show, showPassword, hidePassword]
}
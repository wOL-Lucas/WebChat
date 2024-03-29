import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState } from "react";



const Load = () => {
    const location = useLocation();
    const chatName = new URLSearchParams(location.search).get("chat");
    const [wsToken, setWsToken] = useState(null);
    const navigate = useNavigate();

    while (!wsToken) {
        fetch("https://localhost:6800/ws/login", {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`
            }
        }).then(response => response.json())
            .then(data => setWsToken(data.token))
            .catch(error => console.error(error));
    

        return (
            <div>Loading...</div>
        )
    }

    localStorage.setItem("wsToken", wsToken);
    navigate(`/chat?chat=${chatName}`);

}

export default Load;

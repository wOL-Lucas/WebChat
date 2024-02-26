import styled from 'styled-components';
import useWebSocket from 'react-use-websocket';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import Messages from '../../components/messages/messages';

const Container = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    `;

const Form = styled.div`
    width: 100%;
    margin: 0;
    box-sizing: border-box;
    display: flex;
    background-color: #f8f8f8;
    border-top: 1px solid #ccc;
    border-radius: 0 0 10px 10px;
    `;

const MessageInput = styled.input`
    width: 100%;
    height: 40px;
    border: none;
    border-radius: 10px;
    margin: 10px;
    `;

const Button = styled.button`
    height: 40px;
    border: none;
    border-radius: 30%;
    margin: 10px;
`;

const Chat = () => {
    const location = useLocation();
    const chatName = new URLSearchParams(location.search).get("chat");
    const username = localStorage.getItem("username");

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    const setmessage = (message) => {
        setMessage(message)
    }
    const wsToken = localStorage.getItem("wsToken");

    const socket = useWebSocket(`wss://localhost:6800/ws/${chatName}?token=${wsToken}`, {
        onOpen: () => {
            console.log("opened")
        },

        onMessage: (event) => {
            console.log(typeof event.data);
            let message = JSON.parse(event.data);
            console.log(message);
            updateMessages(message.message, message.username, message.datetime, false);
        },
        
        onChange: (event) => {
            console.log(event)
        },

        onClose: () => {
            console.log("closed")
        }

    })


    const sendMessage = () => {
        let date = new Date()
        let datetime = date.toLocaleDateString() + " " + date.toLocaleTimeString()

        socket.sendJsonMessage({
            "message": message,
            "username": username,
            "datetime": datetime
        })

        updateMessages(message, datetime, localStorage.getItem("username"), true)
        setmessage("")
    }

    const updateMessages = (NewMessage, username, MessageDateTime,isSelf) => {
        console.log(NewMessage, isSelf)
        setMessages([...messages, {"text":NewMessage, "user":username, "datetime":MessageDateTime, "isSelf":isSelf}])
    }

    return (
        <Container>
            <Messages content={messages} isSelf={false}/>
            <Form>
                <MessageInput type="text" placeholder="Type a message..." value={message} onChange={(event)=>{setmessage(event.target.value)}} onKeyDown={(event)=>{if(event.key === "Enter"){sendMessage()}}}/>
                <Button onClick={sendMessage}>Send</Button>
            </Form>
        </Container>
    )
};


export default Chat;

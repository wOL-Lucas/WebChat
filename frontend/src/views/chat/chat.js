import styled from 'styled-components';
import useWebSocket from 'react-use-websocket';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import Message from '../../components/message/message';

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

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    const setmessage = (message) => {
        setMessage(message)
    }

    const socket = useWebSocket("wss://localhost:6800/ws/" + chatName, {
        onOpen: () => {
            console.log("opened")
        },

        onMessage: (event) => {
            const reader = new FileReader();
            reader.onload = () => {
                let message = JSON.parse(reader.result).message
                updateMessages(message, false)
            }
            reader.readAsText(event.data)
        },
        
        onChange: (event) => {
            console.log(event)
        },

        onClose: () => {
            console.log("closed")
        }

    })


    const sendMessage = () => {
        socket.sendJsonMessage({
            "message": message,
            "username": "test"
        })

        updateMessages(message, true)
        setmessage("")
    }

    const updateMessages = (message, isSelf) => {
        setMessages([...messages, {"text":message, "isSelf":isSelf}])
    }

    return (
        <Container>
            <Message content={messages} isSelf={false}/>
            <Form>
                <MessageInput type="text" placeholder="Type a message..." value={message} onChange={(event)=>{setmessage(event.target.value)}} onKeyDown={(event)=>{if(event.key === "Enter"){sendMessage()}}}/>
                <Button onClick={sendMessage}>Send</Button>
            </Form>
        </Container>
    )
};


export default Chat;
import styled from 'styled-components';
import useWebSocket from 'react-use-websocket';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Messages from '../../components/messages/messages';
import { GrantMicPermission, FinishDeviceUsage } from '../../utils/PeripheralsHandler';
import { blobParser } from '../../utils/blobParser';
import MicIcon from '../../assets/mic.png';
import SendIcon from '../../assets/send.png';


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
    width: 40px;
    border: 1px solid #ccc;
    border-radius: 50%;
    margin: 10px;
    background-color: #f8f8f8;
    
    img{
      width: 20px;
      heigth: auto;
      margin: 0;
      padding: 0;
    }

`;

const Chat = () => {
    const location = useLocation();
    const chatName = new URLSearchParams(location.search).get("chat");
    const username = localStorage.getItem("username");

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [audioChunks, setAudioChunks] = useState([]);
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
    
    const handleIncomingAudioChunks = (event) => {
        setAudioChunks([...audioChunks, event.data]);
    }
    
    const recordAudio = async () => {
        try {
            setIsRecording(true);
            const stream = await GrantMicPermission();
            const mediaRecorder = new MediaRecorder(stream);
            setMediaRecorder(mediaRecorder);
            
            
            mediaRecorder.start(2000);
            mediaRecorder.ondataavailable = (event) => {
                handleIncomingAudioChunks(event);
            }
            
            mediaRecorder.onstop = () => {
                console.log("audioChunks", audioChunks.length);
            }
        } catch (error) {
            console.log(error);
        }
    }


    const sendAudioMessage = (blob) => {
        let date = new Date()
        let datetime = date.toLocaleDateString() + " " + date.toLocaleTimeString()
        let blobAsBase64 = blobParser(blob);
        blobAsBase64.then((base64data) => {  
            socket.sendJsonMessage({
              "message": base64data,
              "username": username,
              "type":"audio",
              "datetime": datetime
            })
        })
        updateMessages(blob, localStorage.getItem("username"), "audio", datetime, true)
        setAudioChunks([]);
        console.log("audiochunks length ", audioChunks.length)
    }

    const sendTextMessage = () => {
        let date = new Date()
        let datetime = date.toLocaleDateString() + " " + date.toLocaleTimeString()

        socket.sendJsonMessage({
            "message": message,
            "username": username,
            "type":"text",
            "datetime": datetime
        })

        updateMessages(message, localStorage.getItem("username"), "text", datetime,true)
        setmessage("")
    }
    
    const finishRecording = () => {
        console.log(audioChunks)
        setIsRecording(false);
        FinishDeviceUsage(mediaRecorder.stream);
        mediaRecorder.stop();
        sendAudioMessage(new Blob(audioChunks, {type: "audio/wav"}));
    }


    const updateMessages = (NewMessage, username, type, MessageDateTime,isSelf) => {
        console.log(NewMessage, isSelf)
        setMessages([...messages, {"content":NewMessage, "user":username, "type":type, "datetime":MessageDateTime, "isSelf":isSelf}])
    }

    return (
        <Container>
            <Messages content={messages} isSelf={false}/>
            <Form>
                <MessageInput type="text" placeholder="Type a message..." value={message} onChange={(event)=>{setmessage(event.target.value)}} onKeyDown={(event)=>{if(event.key === "Enter" && message !== ""){sendTextMessage()}}}/>
                <Button onClick={message === "" ? (isRecording ? finishRecording : recordAudio) : sendTextMessage}><img src={isRecording ? SendIcon : (message === "" ? MicIcon : SendIcon)}/></Button>
            </Form>
        </Container>
    )
};


export default Chat;

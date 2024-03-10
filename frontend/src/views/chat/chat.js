import styled from 'styled-components';
import useWebSocket from 'react-use-websocket';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import Messages from '../../components/messages/messages';
import { GrantMicPermission, FinishDeviceUsage } from '../../utils/PeripheralsHandler';
import { blobToBase64, base64toBlob } from '../../utils/blobParser';
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
    background-color: #cccccc;
    border-top: 1px solid #ccc;
    border-radius: 0 0 10px 10px;
    `;

const MessageInput = styled.input`
    width: 100%;
    height: 40px;
    border: none;
    border-radius: 10px;
    margin: 10px;
    &:focus{
      outline: 1px solid var(--root-color);
    }
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
    
    &:focus{
      outline: 1px solid var(--root-color);
      background-color: #f0f0f0;
    }
    
    @keyFrames pulse {
      0% { 
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
          }
      50% { 
            transform: scale(1.1);
            box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
          }
      100% { 
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
          }
    }
    
    animation: ${props => props.isrecording ? "pulse 1s infinite" : "none"};
    outline: ${props => props.isrecording ? "1px solid var(--secondary-color)" : "none"};
`;

const Chat = () => {
    const location = useLocation();
    const chatName = new URLSearchParams(location.search).get("chat");
    const username = localStorage.getItem("username");

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const setmessage = (message) => {
        console.log(message)
        setMessage(message)
    }


    const wsToken = localStorage.getItem("wsToken");

    const socket = useWebSocket(`wss://localhost:6800/ws/${chatName}?token=${wsToken}`, {
        onOpen: () => {
            console.log("opened")
        },

        onMessage: (event) => {
            let message = JSON.parse(event.data);

            if(message.type === "audio"){
                message.message = base64toBlob(message.message, "audio/wav");
            }
            
            updateMessages(message.message, message.username, message.type, message.datetime, false);
        },
        
        onChange: (event) => {
            console.log(event)
        },

        onClose: () => {
            console.log("closed")
        }

    })
    
    const recordAudio = async () => {
        try {
            setIsRecording(true);
            const stream = await GrantMicPermission();
            const mediaRecorder = new MediaRecorder(stream);
            setMediaRecorder(mediaRecorder);
            
            let audioChunks = [];
            mediaRecorder.start(2000);
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            }
            
            
            mediaRecorder.onstop = () => {
                let audioBlob = new Blob(audioChunks, {type: 'audio/wav'});
                sendAudioMessage(audioBlob);
            }
        } catch (error) {
            console.log(error);
        }
    }


    const sendAudioMessage = (blob) => {
        let date = new Date()
        let datetime = date.toLocaleDateString() + " " + date.toLocaleTimeString()
        let blobAsBase64 = blobToBase64(blob);
        blobAsBase64.then((base64data) => {  
            socket.sendJsonMessage({
              "message": base64data,
              "username": username,
              "type":"audio",
              "datetime": datetime
            })
        })
        updateMessages(blob, localStorage.getItem("username"), "audio", datetime, true)
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
        setIsRecording(false);
        FinishDeviceUsage(mediaRecorder.stream);
        mediaRecorder.stop();
    }


    const updateMessages = (NewMessage, username, type, MessageDateTime,isSelf) => {
        setMessages([...messages, {"content":NewMessage, "user":username, "type":type, "datetime":MessageDateTime, "isSelf":isSelf}])
    }

    return (
        <Container>
            <Messages content={messages} isSelf={false}/>
            <Form>
                <MessageInput type="text" placeholder="Type a message..." value={message} onChange={(event)=>{setmessage(event.target.value)}} onKeyDown={(event)=>{if(event.key === "Enter" && message !== ""){sendTextMessage()}}}/>
                <Button isrecording={isRecording ? true : false} onClick={message === "" ? (isRecording ? finishRecording : recordAudio) : sendTextMessage}><img src={isRecording ? SendIcon : (message === "" ? MicIcon : SendIcon)}/></Button>
            </Form>
        </Container>
    )
};


export default Chat;

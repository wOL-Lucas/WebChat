import styled from 'styled-components';
import { useState } from 'react';


const Container = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;


const Form = styled.form`
    width: 25%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
`;

const Input = styled.input`
    width: 100%;
    height: 40px;
    border: none;
    border-bottom: 1px solid #ccc;
    margin-bottom: 20px;
    font-size: 18px;
    padding-left: 10px;
    padding-right: 10px;
`;

const Create = () => {
    const [chatName, setChatName] = useState('');
    const [chatImage, setChatImage] = useState('');

    const createChat = (event) => {

        fetch('https://localhost:6800/chats', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify(
                {
                    "name": chatName,
                    "image": chatImage,
                    "users":[
                        {
                            "username": localStorage.getItem('username')
                        }
                    ]
                }
            )

        }).then(response => {
            if(response.status === 200){
                alert('Chat created successfully');
            }else{
                alert(response.status);
            }
        }
        );

    }

    return (
        <Container>
            <Form onSubmit={createChat}>
                <Input type="text" placeholder="Enter the chat name"  onChange={(event)=>{setChatName(event.target.value)}}/>
                <Input type="text" placeholder="Enter the chat image URL" onChange={(event)=>{setChatImage(event.target.value)}}/>
                <button>Create</button>
            </Form>
        </Container>
    )  
}

export default Create;
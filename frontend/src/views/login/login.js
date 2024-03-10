import React, { useState } from 'react';
import styled from 'styled-components';
import logo_image from '../../assets/no_bg_logo.png'
import axios from 'axios';
import {useSignIn} from 'react-auth-kit';

const LoginContainer = styled.div`
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;

    background: linear-gradient(137deg,var(--root-color), white, var(--secondary-color), white);
    background-size: 500% 400%;
    animation: mainFade 21s ease infinite;

`;

const Box = styled.div`
    width: 100%;
    max-width: 400px;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 10px;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
    img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 0 auto;
        border-radius: 10px;
    }
`;

const InputContainer = styled.div`
    margin-top: 20px;
    padding-top: 10px;
    position: relative;
`;

const FloatingPlaceholder = styled.p`
    position: absolute;
    pointer-events: none;
    transition: all 0.3s ease;
    margin: 0;
    opacity: ${props => props.visible ? '1' : '0.5'};
    left: 10px;
    transform: translateY(${props => props.visible ? '-35px' : '0'});
    font-size: ${props => props.visible ? '16px' : 'initial'};
    color: ${props => props.visible ? 'gray' : 'initial'};
`;

const Input = styled.input`
    width: 100%;
    box-sizing: border-box;
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 8px;
    border: 1px solid #ccc;
    font-size: 16px;

    &:focus {
        outline: none;
        border-color: var(--root-color);
    
    }
`;

const Button = styled.button`
    width: 100%;
    height: 40px;
    margin-top: 20px;
    border-radius: 5px;
    border: none;

    background: linear-gradient(137deg,var(--root-color), white, var(--secondary-color), white);
    background-size: 500% 400%;
    animation: mainFade 21s ease infinite;

    color: black;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: var(--secondary-color);
    }
`;


function Login() {
    const signIn = useSignIn();
    const [username, setusername] = useState('');
    const [password, setpassword] = useState('');


    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const response = await axios.post('https://localhost:6800/login', {
                "username":username,
                "password":password,
            });
    
            signIn({
                token: response.token,
                expiresIn: 7200,
                tokenType: 'Bearer',
                authState: { username: username},
            })
    
            if (response.data.token) {
                console.log('Login successful');

                localStorage.setItem('username', username);
                localStorage.setItem('token', response.data.token);

                window.location.href = `home`;
            } 
            else {
                console.error('Authentication failed');
            }
        } catch (error) {
            console.error('Error during authentication', error);
        }
      };

    return (
        <LoginContainer>
            <Box>
                <Logo>
                    <img src={logo_image} alt="logo" />
                </Logo>
                <form onSubmit={handleSubmit}>
                    <InputContainer>
                        <FloatingPlaceholder visible={!!username}>Usuário</FloatingPlaceholder>
                        <Input type="text" onChange={e => setusername(e.target.value)} />
                    </InputContainer>

                    <InputContainer>
                        <FloatingPlaceholder visible={!!password}>Senha</FloatingPlaceholder>
                        <Input type="password" onChange={e => setpassword(e.target.value)} />
                    </InputContainer>

                    <div>
                        <Button type='submit'>Entrar</Button>
                    </div>
                </form>
            </Box>
        </LoginContainer>
    );
}

export default Login;

import styled from 'styled-components';
import Logo from '../logo/logo';
import icon from '../../assets/chat.png';
import newChat from '../../assets/newchat.png';
import ListItem from '../listItem/listItem';
import { useEffect, useState } from 'react';

const SidebarContainer = styled.div`
    
    width: 20%;
    height: 100vh;
    padding-left: 5px;
    padding-right: 5px;
    background: linear-gradient(180deg, #ffff 0%, var(--root-color) 100%);
    border-right: 1px solid #e0e0e0;

    display: flex;
    flex-direction: column;
    align-items: center;
    
    ul{
        padding: 0;
    }
    
    `


const ListItems = ({items}) => {
    return (
        <ul>
            {items.map((item, index) => (
                <ListItem key={index} text={item.text} icon={item.icon ? item.icon : icon} module={item.module} />
            ))}
        </ul>
    )
}

const Siderbar = () => {

    const [items, setItems] = useState([]);

    const getChats = async () => {
        fetch('https://localhost:6800/chats', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then(response => response.json())
        .then(data => {
            let chats = []
            chats.push({"text": "New Chat", "icon": newChat, "module": "create"})
            data.forEach(chat => {
                chats.push({"text": chat.name, "icon": icon, "module": `load?chat=${chat.name.toLowerCase().replace(/ /g, "_")}`})                
            })
            setItems(chats)
        })
    }

    useEffect(()=>{
        getChats();
    }, [])

    return (
        <SidebarContainer>
            <Logo />
            <ListItems items={items} />
        </SidebarContainer>
    );
}

export default Siderbar;
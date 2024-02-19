import styled from 'styled-components';
import Logo from '../logo/logo';
import ListItem from '../listItem/listItem';

const SidebarContainer = styled.div`
    
    width: 20%;
    height: 100vh;
    padding-left: 5px;
    padding-right: 5px;
    background: linear-gradient(180deg, #ffff 0%, var(--root-color) 100%);
    border-right: 1px solid #e0e0e0;
    padding: 0px 20px 0px 20;

    display: flex;
    flex-direction: column;
    align-items: center;
    `

const Siderbar = () => {
    const items = [
        {
            text: "New Chat",
            icon: "💬",
            module: "/create"
        }
    ]

    return (
        <SidebarContainer>
            <Logo />
            <ul>
                {items.map((item, index) => (
                    <ListItem key={index} text={item.text} icon={item.icon} module={item.module} />
                ))}
            </ul>
        </SidebarContainer>
    );
}

export default Siderbar;
import logo_image from '../../assets/no_bg_logo.png'
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const LogoContainer = styled.div`
    img{
        max-width: 100%;
        height: auto;
        display: block;
        margin: 0 auto;
        border-radius: 10px;
    }

    width: 100%;
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
`;

const Logo = () => {
    const navigate = useNavigate();
    const redirectToModule = (event, module) => {
        navigate(module);
    }

    return (
        <LogoContainer onClick={(event)=>{redirectToModule(event, "/home")}}>
            <img src={logo_image} alt="logo" />
        </LogoContainer>
    );
}

export default Logo;

import styled from 'styled-components';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

 
const Container = styled.div`
    img{
      height: auto;
      max-height: 40px;
    }
    width: 100%;
    height: auto;
    display: flex;
    justify-content: left;
    align-items: center;
    list-style: none;
    border-bottom: 1px solid #e0e0e0;
    color: ${props => props.wasclicked ? 'var(--secondary-color)' : 'var(--primary-color)'};
    &:hover{
      border-color: var(--secondary-color);
      color: var(--secondary-color);
      cursor: pointer;
    
    }

    p{
      margin: 0;
      padding: 10px;
      font-size: 20px;
    }
`;

const ListItem = ({text, icon, module}) => {
  const [clicked, setClicked] = useState(false);
  
  const navigate = useNavigate();
  const RedirectToModule = (event, module) => {
    console.log("module", module)
    navigate(module);
  }

  return (
    <Container wasclicked={clicked} onClick={(event)=>{setClicked(true); RedirectToModule(event, module)}}>
      <img src={icon} alt="icone"/>
      <p>{text}</p>
    </Container>
    )
}

export default ListItem;

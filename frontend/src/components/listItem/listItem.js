import styled from 'styled-components';
import redirectToModule from '../../utils/redirectToModule';

const Container = styled.div`
    
    width: 100%;
    height: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    list-style: none;
    border-bottom: 1px solid #e0e0e0;

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
    return (
        <Container onClick={(event)=> redirectToModule(event, module)}>
            <p>{text}</p>
            <p>{icon}</p>
        </Container>
    )
}

export default ListItem;
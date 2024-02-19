import styled from 'styled-components';

const MessageContainer = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const Message = (content) => {
    return (
        <MessageContainer>
            <h1>{content}</h1>
        </MessageContainer>
    )
}

export default Message;
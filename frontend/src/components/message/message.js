import styled from 'styled-components';

const MessageContainer = styled.div`
    width: 100%;
    height: 90%;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #f8f8f8;
    border-radius: 10px;
`;

const MessageBody = styled.div`
    width: 100%;
    padding: 0;
    margin: 5px;
    display:flex;
    justify-content: ${props => props.selfMessage ? "flex-end" : "flex-start"};

    p{  
        max-width: fit-content;
        margin: 5px 5px 5px 5px;
        
        padding: 10px;
        background-color: ${props => props.selfMessage ? "var(--root-color)" : "var(--secondary-color)"};
        border-radius: 10px;
    }

`

const Message = ({content}) => {
    return (
        <MessageContainer>
            {
                Array.from(content).map((message, index) => (
                    <MessageBody key={index} selfMessage={message.isSelf}><p>{message.text}</p></MessageBody>
                ))
            }
        </MessageContainer>
    )
}

export default Message;
import styled from 'styled-components';

const MessageContainer = styled.div`
    width: 100%;
    height: 100%;
    margin-left: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #f8f8f8;
`;

const MessageBody = styled.div`
    width: 100%;
    margin: 5px;
    display:flex;
    align-items: ${props => props.selfMessage ? "end" : "start"};

    p{  
        max-width: fit-content;
        margin: 0;
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
import styled from 'styled-components';

const MessageContainer = styled.div`
    width: 100%;
    height: 87%;
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
    justify-content: ${props => props.selfmessage ? "flex-end" : "flex-start"};

    div{  
        max-width: fit-content;
        margin: 5px 5px 5px 5px;
        
        padding: 10px;
        background-color: ${props => props.selfmessage ? "var(--root-color)" : "var(--secondary-color)"};
        border-radius: 10px;
    }
`

const MessageText = styled.p`
    margin: 0;
    padding: 0;
    font-size: 18px;
    color: #333;
`;

const AudioMessage = styled.audio`
    margin: 0;
    padding: 0;
    font-size: 18px;
    background-color: var(--root-color);
    border-radius: 10px;
` 

const MessageUser = styled.p`
    margin: 0;
    padding: 0;
    font-size: 12px;
    color: #666;
`;


const Messages = ({content}) => {
    return (
        <MessageContainer>
            {
                Array.from(content).map((message, index) => (
                    <MessageBody key={index} selfmessage={message.isSelf}>
                        <div>
                          {message.type === "text" ? 
                          (<MessageText>{message.content}</MessageText>)
                          : 
                          (<AudioMessage src={URL.createObjectURL(message.content)} controls></AudioMessage>)
                          }
                          <MessageUser><b>{message.user}</b> - {message.datetime}</MessageUser>
                        </div>
                    </MessageBody>
                ))
            }
        </MessageContainer>
    )
}

export default Messages;

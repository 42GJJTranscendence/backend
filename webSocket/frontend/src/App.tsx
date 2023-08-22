import React from 'react'
import classNames from 'classnames'
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { io } from 'socket.io-client'
import { ChatContainer, Message, MessageBox, MessageForm } from './app.styles'

const socket = io('http://localhost:4000/chat')

interface IChat {
  username: string
  message: string
}

const App = () => {
  const [chats, setChats] = useState<IChat[]>([])
  const [message, setMessage] = useState<string>('')
  const chatContainerEl = useRef<HTMLDivElement>(null)

  // 채팅이 길어지면(chats.length) 스크롤이 생성되므로, 스크롤의 위치를 최근 메시지에 위치시키기 위함
  useEffect(() => {
    if (!chatContainerEl.current) return

    const chatContainer = chatContainerEl.current
    const { scrollHeight, clientHeight } = chatContainer

    if (scrollHeight > clientHeight) {
      chatContainer.scrollTop = scrollHeight - clientHeight
    }
  }, [chats.length])

  // message event listener
  useEffect(() => {
    const messageHandler = (chat: IChat) =>
      setChats(prevChats => [...prevChats, chat])
    socket.on('message', messageHandler)

    return () => {
      socket.off('message', messageHandler)
    }
  }, [])

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
  }, [])

  const onSendMessage = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!message) return alert('메시지를 입력해 주세요.')

      socket.emit('message', message, (chat: IChat) => {
        setChats(prevChats => [...prevChats, chat])
        setMessage('')
      })
    },
    [message]
  )

  return (
    <>
      <h1>WebSocket Chat</h1>
      <ChatContainer ref={chatContainerEl}>
        {chats.map((chat, index) => (
          <MessageBox
            key={index}
            className={classNames({
              my_message: socket.id === chat.username,
              alarm: !chat.username,
            })}
          >
            <span>
              {chat.username
                ? socket.id === chat.username
                  ? ''
                  : chat.username
                : ''}
            </span>
            <Message className="message">{chat.message}</Message>
          </MessageBox>
        ))}
      </ChatContainer>
      <MessageForm onSubmit={onSendMessage}>
        <input type="text" onChange={onChange} value={message} />
        <button>보내기</button>
      </MessageForm>
    </>
  )
}

export default App

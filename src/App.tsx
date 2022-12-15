import React, { useState } from 'react';
import Title from './components/Title';
import { MessageList } from './components/MessageList';
import ContactList from './components/ContactList';
import SendMessageForm from './components/SendMessageForm';
import * as web3 from "@solana/web3.js";
import './App.css';


function App() {

  const [recipient, setRecipient] = useState<string>("")
  // const recipient = new web3.PublicKey("BHMfc26jnTGcTzPqNo9a8nvnu4PyAqAcAejKrjRaDXAu")


  return (
    <div className="app">
      <Title recipient={recipient} setRecipient={setRecipient}/>
      <div className="body">
        {/* <ContactList contacts={contacts} /> */}
        <div className="body-messages">
          <MessageList recipient={recipient} />
          <SendMessageForm recipient={recipient} />
        </div>
      </div>
    </div>
  );
}

export default App;

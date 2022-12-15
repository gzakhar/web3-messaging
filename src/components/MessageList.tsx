import { FC, useEffect, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Message } from '../models/Message';
import { MessageCoordinator } from "../coordinators/MessageCoordinator";
import * as web3 from "@solana/web3.js";

interface MessageListProps {
    recipient: string;
}

export const MessageList: FC<MessageListProps> = ({
    recipient
}: MessageListProps) => {

    const { connection } = useConnection();
    const [messages, setMessages] = useState<Message[]>([])
    const { publicKey } = useWallet()


    useEffect(() => {

        if (!publicKey) {
            alert("Please connect your wallet!")
            return
        }
        const interval = setInterval(() => {
            updateMessages(publicKey);
        }, 1000);
        return () => clearInterval(interval);

    }, [publicKey, recipient])


    const updateMessages = (pubkey: web3.PublicKey) => {
        MessageCoordinator.fetchMessages(
            connection,
            pubkey,
            new web3.PublicKey(recipient),
        ).then(setMessages)
    }

    return (
        <ul className="message-list">
            {messages.map((message, id) => {
                if (!publicKey) { return }
                let isSent = message.sender.equals(publicKey)
                return (
                    <li key={id} className="message">
                        {!isSent && <div className="address">
                            {message.sender.toBase58()}
                        </div>
                        }
                        <div className={(isSent) ? "message-sender" : "message-reciever"}>
                            {message.message}
                        </div>
                    </li>
                )
            })}
        </ul>
    )
}


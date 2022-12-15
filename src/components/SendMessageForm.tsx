import { FC, useState } from 'react';
import * as web3 from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Message } from '../models/Message';
import { _order_pubkey } from '../utils/utils';
import { MessageCoordinator } from '../coordinators/MessageCoordinator';
import BN from "bn.js";
import { Buffer } from "buffer"

const POLY_CHAT_PROGRAM_ID = "3cjVMt1Uwa8F9F2srHAS2kGQCqbraaX3wDRAqya2CkMC"

interface SendMessageFormProps {
    recipient: string;
}

const SendMessageForm: FC<SendMessageFormProps> = ({
    recipient
}: SendMessageFormProps) => {

    const [message, setMessage] = useState<string>("")

    const { connection } = useConnection()
    const { publicKey, sendTransaction } = useWallet()

    const handleSubmit = (e: any) => {
        e.preventDefault()

        if (!publicKey) {
            alert("Please connect your wallet!")
            return
        }

        try {
            let messageToSend = new Message(publicKey, new web3.PublicKey(recipient), message)

            handleTransactionSubmit(messageToSend)
            setMessage("")
        } catch (error) {

        }
    }

    const handleTransactionSubmit = async (message: Message) => {

        try {

            const transaction = new web3.Transaction()

            const [counterPda] = web3.PublicKey.findProgramAddressSync(
                [_order_pubkey(message.sender, message.recipient), Buffer.from("counter")],
                new web3.PublicKey(POLY_CHAT_PROGRAM_ID)
            )

            await MessageCoordinator.syncMessageCount(connection, message.sender, message.recipient);
            const messageCounter = MessageCoordinator.messageCounter
            const [messagePda] = web3.PublicKey.findProgramAddressSync(
                [
                    _order_pubkey(message.sender, message.recipient),
                    new BN(messageCounter).toArrayLike(Buffer, "be", 8)
                ],
                new web3.PublicKey(POLY_CHAT_PROGRAM_ID)
            )

            const buffer = message.serialize()

            console.log(buffer.toJSON())

            const instruction = new web3.TransactionInstruction({
                programId: new web3.PublicKey(POLY_CHAT_PROGRAM_ID),
                data: buffer,
                keys: [
                    {
                        pubkey: message.sender,
                        isSigner: true,
                        isWritable: false
                    },
                    {
                        pubkey: message.recipient,
                        isSigner: false,
                        isWritable: false
                    },
                    {
                        pubkey: counterPda,
                        isSigner: false,
                        isWritable: true
                    },
                    {
                        pubkey: messagePda,
                        isSigner: false,
                        isWritable: true
                    },
                    {
                        pubkey: web3.SystemProgram.programId,
                        isSigner: false,
                        isWritable: false
                    }
                ]
            })

            transaction.add(instruction)

            try {
                let txid = await sendTransaction(transaction, connection)
                console.log(
                    `Transaction submitted: https://explorer.solana.com/tx/${txid}?cluster=devnet`
                )
            } catch (e) {
                console.log(JSON.stringify(e))
                alert(JSON.stringify(e))
            }
        } catch {

        }

    }


    return (
        <form
            onSubmit={handleSubmit}
            className="send-message-form">
            <input
                onChange={(e) => setMessage(e.target.value)}
                value={message}
                placeholder="PolyMessage"
                type="text"
                disabled={false} />
        </form>
    )

}

export default SendMessageForm;
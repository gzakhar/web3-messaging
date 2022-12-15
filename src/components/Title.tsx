import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as web3 from '@solana/web3.js';
import React, { useState } from 'react';
import { _order_pubkey } from '../utils/utils';

const POLY_CHAT_PROGRAM_ID = "3cjVMt1Uwa8F9F2srHAS2kGQCqbraaX3wDRAqya2CkMC"

interface TitleProps {
    recipient: string;
    setRecipient: CallableFunction;
}

const Title = ({
    recipient,
    setRecipient
}: TitleProps) => {

    const { connection } = useConnection()
    const { publicKey, sendTransaction } = useWallet()

    const handleSubmit = (e: any) => {
        e.preventDefault()

        if (!publicKey) {
            alert("Please connect your wallet!")
            return
        }

        handleTransactionSubmit(new web3.PublicKey(recipient), publicKey)
    }

    const handleTransactionSubmit = async (recipient: web3.PublicKey, sender: web3.PublicKey) => {


        const [pda] = web3.PublicKey.findProgramAddressSync(
            [_order_pubkey(sender, recipient), Buffer.from("counter")],
            new web3.PublicKey(POLY_CHAT_PROGRAM_ID)
        )

        const transaction = new web3.Transaction()

        console.log(`PDA account: ${pda}`)

        const instruction = new web3.TransactionInstruction({
            programId: new web3.PublicKey(POLY_CHAT_PROGRAM_ID),
            data: Buffer.from([1]),
            keys: [
                {
                    pubkey: sender,
                    isSigner: true,
                    isWritable: false
                },
                {
                    pubkey: recipient,
                    isSigner: false,
                    isWritable: false
                },
                {
                    pubkey: pda,
                    isSigner: false,
                    isWritable: true
                },
                {
                    pubkey: web3.SystemProgram.programId,
                    isSigner: false,
                    isWritable: false
                }
            ],
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

    }


    return (
        <div className="title">
            <form>
                <input
                    onChange={(e) => setRecipient(e.target.value)}
                    value={recipient}
                    placeholder="recipient"
                    type="text"></input>
                <button onClick={handleSubmit}>Chat!</button>
            </form>
            <p>Polychat</p>
            <WalletMultiButton />
        </div>
    )
}

export default Title
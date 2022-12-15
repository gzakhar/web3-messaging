import * as borsh from "@project-serum/borsh";
import * as web3 from "@solana/web3.js"
import { _order_pubkey } from "../utils/utils";
import BN from "bn.js";
import { Message } from "../models/Message";


const POLY_CHAT_PROGRAM_ID = "3cjVMt1Uwa8F9F2srHAS2kGQCqbraaX3wDRAqya2CkMC"

export class MessageCoordinator {

    static messageCounter: number = 0

    static counterLayout = borsh.struct([
        borsh.str("discriminator"),
        borsh.u8("isInitialized"),
        borsh.u8("counter"),
    ])


    static async syncMessageCount(
        connection: web3.Connection,
        sender: web3.PublicKey,
        recipient: web3.PublicKey
    ) {
        try {
            const [counterPda] = (web3.PublicKey.findProgramAddressSync(
                [_order_pubkey(sender, recipient), Buffer.from("counter")],
                new web3.PublicKey(POLY_CHAT_PROGRAM_ID)
            ))
            const account = await connection.getAccountInfo(counterPda)
            this.messageCounter = this.counterLayout.decode(account?.data).counter;

        } catch (error) {
            console.log(error)
        }
    }

    static async fetchMessages(
        connection: web3.Connection,
        sender: web3.PublicKey,
        recipient: web3.PublicKey,
    ): Promise<Message[]> {

        await this.syncMessageCount(connection, sender, recipient)
        console.log(`Current message count: ${this.messageCounter}`)
        let messagePdas: web3.PublicKey[] = []

        for (let i = 0; i < this.messageCounter + 2; i++) {

            const [messagePda] = web3.PublicKey.findProgramAddressSync(
                [
                    _order_pubkey(sender, recipient),
                    new BN([i]).toArrayLike(Buffer, "be", 8)
                ],
                new web3.PublicKey(POLY_CHAT_PROGRAM_ID)
            )
            messagePdas.push(messagePda)
        }

        const accounts = await connection.getMultipleAccountsInfo(messagePdas)

        const messages = accounts.reduce((accum: Message[], account) => {
            const message = Message.deserialize(account?.data)
            if (!message) {
                return accum
            }
            return [...accum, message]
        }, [])

        return messages
    }
}
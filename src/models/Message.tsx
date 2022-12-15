import * as borsh from "@project-serum/borsh"
import { PublicKey } from "@solana/web3.js"


export class Message {
    sender: PublicKey
    recipient: PublicKey
    message: string
    counter: number

    constructor(
        sender: PublicKey,
        recipient: PublicKey,
        message: string,
        counter: number = 0,
    ) {
        this.sender = sender
        this.recipient = recipient
        this.message = message
        this.counter = counter
    }

    private static messageLayout = borsh.struct([
        borsh.str("discriminator"),
        borsh.u8("isInitialized"),
        borsh.u64("counter"),
        borsh.publicKey("sender"),
        borsh.publicKey("recipient"),
        borsh.str("message"),
    ])

    private instructionLayout = borsh.struct([
        borsh.u8("variant"),
        borsh.str("message"),
    ])

    serialize(): Buffer {
        const buffer = Buffer.alloc(1000)
        this.instructionLayout.encode({ ...this, variant: 0 }, buffer)
        return buffer.slice(0, this.instructionLayout.getSpan(buffer))
    }

    static deserialize(buffer?: Buffer): Message | null {

        if (!buffer) return null

        try {
            const { counter, sender, recipient, message } = this.messageLayout.decode(buffer)
            return new Message(sender, recipient, message, counter)
        } catch (e) {
            console.log("Deserialization error:", e)
            console.log(buffer)
            return null
        }
    }

}
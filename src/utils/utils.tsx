import * as web3 from "@solana/web3.js"

export function _order_pubkey(
    sender: web3.PublicKey,
    recipient: web3.PublicKey,
): Buffer {
    const len = 10
    if (sender < recipient) {
        return Buffer.concat([sender.toBuffer().slice(0, len), recipient.toBuffer().slice(0, len)])
    } else {
        return Buffer.concat([recipient.toBuffer().slice(0, len), sender.toBuffer().slice(0, len)])
    }
}
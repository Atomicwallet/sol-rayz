import { Connection } from "@solana/web3.js";
import { StringPublicKey } from "./types";
export declare enum TokenType {
    nftsOnly = "nftsOnly",
    tokensOnly = "tokensOnly"
}
export declare type Options = {
    /**
     * Wallet public address
     */
    publicAddress: StringPublicKey; /**
     * Receive only required token types
     */
    tokenType: TokenType; /**
     * Optionally provide your own connection object.
     * Otherwise createConnectionConfig() will be used
     */
    connection?: Connection; /**
     * Limit response by this number
     * by default response limited by 5000 NFTs.
     */
    limit?: number; /**
     * Limit number of PublicKeys per request to `getMultipleAccountsInfo`
     * Default is 99
     */
    metaAccountsRequestChunkSize?: number;
};
/**
 * @throws if it has wrong tokenType param
 */
export declare const getParsedTokenAccountsByOwner: ({ publicAddress, tokenType, connection, limit, metaAccountsRequestChunkSize, }: Options) => Promise<unknown[]>;
//# sourceMappingURL=getParsedTokenAccountsByOwner.d.ts.map
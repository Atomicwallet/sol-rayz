import { Connection } from "@solana/web3.js";
import { StringPublicKey } from "./types";
export declare type Options = {
    /**
     * Wallet public address
     */
    publicAddress: StringPublicKey;
    /**
     * Optionally provide your own connection object.
     * Otherwise createConnectionConfig() will be used
     */
    connection?: Connection;
    /**
     * Remove possible rust's empty string symbols `\x00` from the values,
     * which is very common issue.
     * Default is true
     */
    sanitize?: boolean;
    /**
     * Convert all PublicKey objects to string versions.
     * Default is true
     */
    stringifyPubKeys?: boolean;
    /**
     * Sort tokens by Update Authority (read by Collection)
     * Default is true
     */
    sort?: boolean;
    /**
     * Limit response by this number
     * by default response limited by 5000 NFTs.
     */
    limit?: number;
    /**
     * Limit number of PublicKeys per request to `getMultipleAccountsInfo`
     * Default is 99
     */
    metaAccountsRequestChunkSize?: number;
};
export declare const getParsedNftAccountsByOwner: ({ publicAddress, connection, sanitize, stringifyPubKeys, sort, limit, metaAccountsRequestChunkSize, }: Options) => Promise<{
    mint: string;
    updateAuthority: string;
    data: {
        creators: any[];
        name: string;
        symbol: string;
        uri: string;
        sellerFeeBasisPoints: number;
    };
    key: import("./config/metaplex").MetadataKey;
    primarySaleHappened: boolean;
    isMutable: boolean;
    editionNonce: number;
    masterEdition?: string;
    edition?: string;
}[]>;
export declare const sanitizeMetaStrings: (metaString: string) => string;
//# sourceMappingURL=getParsedNftAccountsByOwner.d.ts.map
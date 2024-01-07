import {
  Connection, PublicKey,
} from "@solana/web3.js";
import chunks from "lodash.chunk";
import orderBy from "lodash.orderby";
import {
  decodeTokenMetadata, getSolanaMetadataAddress, isValidSolanaAddress, createConnectionConfig,
} from "./utils";
import { TOKEN_PROGRAM } from "./config/solana";
import {
  StringPublicKey, PromiseSettledResult, PromiseFulfilledResult,
} from "./types";

export enum TokenType {
  nftsOnly = "nftsOnly", tokensOnly = "tokensOnly"
}

export type Options = {
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

type TokenObj = {
  tokenType: TokenType;
  mint: StringPublicKey;
  updateAuthority: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  amount?: number;
  uri?: string;
}

type TokenMetadataObj = {
  name: string; symbol?: string; uri?: string; updateAuthority?: string
}

type MintMetadataAddressObj = {
  [mint: string]: {
    address: PublicKey,
  }
}

type MintTokenMetadataObj = {
  [mint: string]: TokenMetadataObj
}

enum sortKeys {
  updateAuthority = "updateAuthority",
}

const createTokenObjectsFromSplAccounts = (splAccounts: any[], tokenType: TokenType): TokenObj[] => {
  return splAccounts
    .reduce((acc, t) => {
      const mint = t.account?.data?.parsed?.info?.mint;
      const decimals = t.account?.data?.parsed?.info?.tokenAmount?.decimals;
      const amount = t.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
      if (tokenType === TokenType.nftsOnly && decimals === 0 && amount >= 1) {
        // We assume NFT is SPL token with decimals === 0 and amount at least 1
        // At this point we filter out other SPL tokens, like coins e.g.
        // Unfortunately, this method will also remove NFTы created before Metaplex NFT Standard
        // like Solarians e.g., so you need to check wallets for them in separate call if you wish
        acc.push({ tokenType, mint });
      }
      if (tokenType === TokenType.tokensOnly && decimals > 0) {
        acc.push({ tokenType, mint, amount, decimals });
      }
      return acc;
    }, []);
};

async function getMetadataObjWithAddress(tokenAccount: TokenObj): Promise<MintMetadataAddressObj> {
  return {
    [tokenAccount.mint]: {
      address: await getSolanaMetadataAddress(new PublicKey(tokenAccount.mint)),
    },
  };
}

async function getMetadataObjListWithAddresses(tokenAccountsList: TokenObj[]): Promise<MintMetadataAddressObj[]> {
  return (await Promise.allSettled(tokenAccountsList.map(getMetadataObjWithAddress)))
    .filter(onlySuccessfullPromises)
    .map((p: PromiseFulfilledResult<MintMetadataAddressObj>) => p.value);
}

function getTokenMetadataFromDecodedMetadata(decodedMetadata: any): TokenMetadataObj {
  const { data, updateAuthority } = decodedMetadata;
  return {
    name: data?.name, symbol: data?.symbol, uri: data?.uri, updateAuthority: updateAuthority?.toString?.(),
  };
}

/**
 * @throws if it has wrong tokenType param
 */
export const getParsedTokenAccountsByOwner = async ({
                                                      publicAddress,
                                                      tokenType,
                                                      connection = createConnectionConfig(),
                                                      limit = 5000,
                                                      metaAccountsRequestChunkSize = 99,
                                                    }: Options) => {
  if (tokenType !== TokenType.nftsOnly && tokenType !== TokenType.tokensOnly) {
    throw new Error(`Wrong token type ${tokenType}`);
  }
  const isValidAddress = isValidSolanaAddress(publicAddress);
  if (!isValidAddress) {
    return [];
  }

  // Get all accounts owned by user
  // and created by SPL Token Program
  // this will include all NFTs, Coins, Tokens, etc.
  const { value: splAccounts } = await connection.getParsedTokenAccountsByOwner(new PublicKey(publicAddress), {
    programId: new PublicKey(TOKEN_PROGRAM),
  });

  const tokensList = createTokenObjectsFromSplAccounts(splAccounts, tokenType);

  // if user have tons of tokens return first N
  const tokensSlice = tokensList?.slice(0, limit);

  async function getTokensMetadatasByMintObj(metadataObjList: MintMetadataAddressObj[]): Promise<MintTokenMetadataObj[]> {
    try {
      const metadataAddressesList = metadataObjList.map((metadataObj) => Object.values(metadataObj)[0].address);
      const accountsList = (await connection.getMultipleAccountsInfo(metadataAddressesList))
        .filter(account => Buffer.isBuffer(account.data));

      const promisesWithParsedMetadata: PromiseSettledResult<[number, TokenMetadataObj]>[] = await Promise.allSettled(accountsList.map(async (account, index) => {
        const tokenMetadata = getTokenMetadataFromDecodedMetadata(await decodeTokenMetadata(account?.data));
        return [index, tokenMetadata];
      }));

      return promisesWithParsedMetadata
        .filter(onlySuccessfullPromises)
        .map(p => p["value"])
        .reduce((metadatasList, [index, tokenMetadata]) => {
          const keyObj = metadataObjList[index];
          if (keyObj) {
            const key = Object.keys(keyObj)[0];
            metadatasList[key] = tokenMetadata;
          }
          return metadatasList;
        }, {});
    } catch (e) {
      // @TODO Add logger
      console.error(e);
    }
  }

  async function getTokensMixedWithMetadata(tokensList: TokenObj[]): Promise<TokenObj[]> {
    // Get Addresses of Metadata Account assosiated with Mint Token
    // This info can be deterministically calculated by Associated Token Program
    // available in @solana/web3.js
    const sliceMetadataWithAddresses = await getMetadataObjListWithAddresses(tokensList);

    const sliceMetadataWithAccounts = await getTokensMetadatasByMintObj(sliceMetadataWithAddresses);

    return tokensList
      .reduce((resultingTokens, token) => {
        const tokenMetadata = sliceMetadataWithAccounts[token.mint];
        if (tokenMetadata) {
          const mixedToken = { ...token, ...sanitizeTokenMeta(tokenMetadata) };
          resultingTokens.push(mixedToken);
        }
        return resultingTokens;
      }, []);
  }

  async function processChunk(chunk: TokenObj[]): Promise<TokenObj[]> {
    try {
      return getTokensMixedWithMetadata(chunk);
    } catch (e) {
      console.error(e);
    }
    return chunk;
  }

  // Mapping chunks to process promises
  const processChunkPromises = chunks(tokensSlice, metaAccountsRequestChunkSize).map(processChunk);

  // Await for all promises to be settled
  const settledChunkPromises: Array<PromiseSettledResult<Promise<TokenObj[]> extends PromiseLike<infer U> ? U : Promise<TokenObj[]>>> = await Promise.allSettled(processChunkPromises);

  const accountsRawMeta = settledChunkPromises
    .filter(({ status }) => status === "fulfilled")
    .flatMap((p) => (p as PromiseFulfilledResult<unknown>).value);

  return orderBy(accountsRawMeta, [sortKeys.updateAuthority], ["asc"]);
};

function sanitizeTokenMeta(tokenData: TokenMetadataObj) {
  return {
    ...tokenData,
    name: sanitizeMetaStrings(tokenData?.name ?? ""),
    symbol: sanitizeMetaStrings(tokenData?.symbol ?? ""),
    uri: sanitizeMetaStrings(tokenData?.uri ?? ""),
  };
}

// Remove all empty space, new line, etc. symbols
// In some reason such symbols parsed back from Buffer looks weird
// like "\x0000" instead of usual spaces.
function sanitizeMetaStrings(metaString: string) {
  return metaString.replace(/\0/g, "");
}

function onlySuccessfullPromises(result: PromiseSettledResult<unknown>): boolean {
  return result && result.status === "fulfilled";
}

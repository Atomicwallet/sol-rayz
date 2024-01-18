"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParsedTokenAccountsByOwner = exports.TokenType = void 0;
var web3_js_1 = require("@solana/web3.js");
var lodash_chunk_1 = __importDefault(require("lodash.chunk"));
var lodash_orderby_1 = __importDefault(require("lodash.orderby"));
var utils_1 = require("./utils");
var solana_1 = require("./config/solana");
var TokenType;
(function (TokenType) {
    TokenType["nftsOnly"] = "nftsOnly";
    TokenType["tokensOnly"] = "tokensOnly";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
var sortKeys;
(function (sortKeys) {
    sortKeys["updateAuthority"] = "updateAuthority";
})(sortKeys || (sortKeys = {}));
var createTokenObjectsFromSplAccounts = function (splAccounts, tokenType) {
    return splAccounts
        .reduce(function (acc, t) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        var mint = (_d = (_c = (_b = (_a = t.account) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.parsed) === null || _c === void 0 ? void 0 : _c.info) === null || _d === void 0 ? void 0 : _d.mint;
        var decimals = (_j = (_h = (_g = (_f = (_e = t.account) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.parsed) === null || _g === void 0 ? void 0 : _g.info) === null || _h === void 0 ? void 0 : _h.tokenAmount) === null || _j === void 0 ? void 0 : _j.decimals;
        var amount = (_p = (_o = (_m = (_l = (_k = t.account) === null || _k === void 0 ? void 0 : _k.data) === null || _l === void 0 ? void 0 : _l.parsed) === null || _m === void 0 ? void 0 : _m.info) === null || _o === void 0 ? void 0 : _o.tokenAmount) === null || _p === void 0 ? void 0 : _p.uiAmount;
        if (tokenType === TokenType.nftsOnly && decimals === 0 && amount >= 1) {
            // We assume NFT is SPL token with decimals === 0 and amount at least 1
            // At this point we filter out other SPL tokens, like coins e.g.
            // Unfortunately, this method will also remove NFTы created before Metaplex NFT Standard
            // like Solarians e.g., so you need to check wallets for them in separate call if you wish
            acc.push({ tokenType: tokenType, mint: mint });
        }
        if (tokenType === TokenType.tokensOnly && decimals > 0) {
            acc.push({ tokenType: tokenType, mint: mint, amount: amount, decimals: decimals });
        }
        return acc;
    }, []);
};
function getMetadataObjWithAddress(tokenAccount) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _b = {};
                    _a = tokenAccount.mint;
                    _c = {};
                    return [4 /*yield*/, (0, utils_1.getSolanaMetadataAddress)(new web3_js_1.PublicKey(tokenAccount.mint))];
                case 1: return [2 /*return*/, (_b[_a] = (_c.address = _d.sent(),
                        _c),
                        _b)];
            }
        });
    });
}
function getMetadataObjListWithAddresses(tokenAccountsList) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.allSettled(tokenAccountsList.map(getMetadataObjWithAddress))];
                case 1: return [2 /*return*/, (_a.sent())
                        .filter(onlySuccessfullPromises)
                        .map(function (p) { return p.value; })];
            }
        });
    });
}
function getTokenMetadataFromDecodedMetadata(decodedMetadata) {
    var _a;
    var data = decodedMetadata.data, updateAuthority = decodedMetadata.updateAuthority;
    return {
        name: data === null || data === void 0 ? void 0 : data.name, symbol: data === null || data === void 0 ? void 0 : data.symbol, uri: data === null || data === void 0 ? void 0 : data.uri, updateAuthority: (_a = updateAuthority === null || updateAuthority === void 0 ? void 0 : updateAuthority.toString) === null || _a === void 0 ? void 0 : _a.call(updateAuthority),
    };
}
/**
 * @throws if it has wrong tokenType param
 */
var getParsedTokenAccountsByOwner = function (_a) {
    var publicAddress = _a.publicAddress, tokenType = _a.tokenType, _b = _a.connection, connection = _b === void 0 ? (0, utils_1.createConnectionConfig)() : _b, _c = _a.limit, limit = _c === void 0 ? 5000 : _c, _d = _a.metaAccountsRequestChunkSize, metaAccountsRequestChunkSize = _d === void 0 ? 99 : _d;
    return __awaiter(void 0, void 0, void 0, function () {
        function getTokensMetadatasByMintObj(metadataObjList) {
            return __awaiter(this, void 0, void 0, function () {
                var metadataAddressesList, accountsList, promisesWithParsedMetadata, e_1;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            metadataAddressesList = metadataObjList.map(function (metadataObj) { return Object.values(metadataObj)[0].address; });
                            return [4 /*yield*/, connection.getMultipleAccountsInfo(metadataAddressesList)];
                        case 1:
                            accountsList = (_a.sent())
                                .filter(function (account) { return Buffer.isBuffer(account === null || account === void 0 ? void 0 : account.data); });
                            return [4 /*yield*/, Promise.allSettled(accountsList.map(function (account, index) { return __awaiter(_this, void 0, void 0, function () {
                                    var tokenMetadata, _a;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                _a = getTokenMetadataFromDecodedMetadata;
                                                return [4 /*yield*/, (0, utils_1.decodeTokenMetadata)(account === null || account === void 0 ? void 0 : account.data)];
                                            case 1:
                                                tokenMetadata = _a.apply(void 0, [_b.sent()]);
                                                return [2 /*return*/, [index, tokenMetadata]];
                                        }
                                    });
                                }); }))];
                        case 2:
                            promisesWithParsedMetadata = _a.sent();
                            return [2 /*return*/, promisesWithParsedMetadata
                                    .filter(onlySuccessfullPromises)
                                    .map(function (p) { return p["value"]; })
                                    .reduce(function (metadatasList, _a) {
                                    var index = _a[0], tokenMetadata = _a[1];
                                    var keyObj = metadataObjList[index];
                                    if (keyObj) {
                                        var key = Object.keys(keyObj)[0];
                                        metadatasList[key] = tokenMetadata;
                                    }
                                    return metadatasList;
                                }, {})];
                        case 3:
                            e_1 = _a.sent();
                            // @TODO Add logger
                            console.error(e_1);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        }
        function getTokensMixedWithMetadata(tokensList) {
            return __awaiter(this, void 0, void 0, function () {
                var sliceMetadataWithAddresses, sliceMetadataWithAccounts;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, getMetadataObjListWithAddresses(tokensList)];
                        case 1:
                            sliceMetadataWithAddresses = _a.sent();
                            return [4 /*yield*/, getTokensMetadatasByMintObj(sliceMetadataWithAddresses)];
                        case 2:
                            sliceMetadataWithAccounts = _a.sent();
                            return [2 /*return*/, tokensList
                                    .reduce(function (resultingTokens, token) {
                                    var tokenMetadata = sliceMetadataWithAccounts[token.mint];
                                    if (tokenMetadata) {
                                        var mixedToken = __assign(__assign({}, token), sanitizeTokenMeta(tokenMetadata));
                                        resultingTokens.push(mixedToken);
                                    }
                                    return resultingTokens;
                                }, [])];
                    }
                });
            });
        }
        function processChunk(chunk) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    try {
                        return [2 /*return*/, getTokensMixedWithMetadata(chunk)];
                    }
                    catch (e) {
                        console.error(e);
                    }
                    return [2 /*return*/, chunk];
                });
            });
        }
        var isValidAddress, splAccounts, tokensList, tokensSlice, processChunkPromises, settledChunkPromises, accountsRawMeta;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (tokenType !== TokenType.nftsOnly && tokenType !== TokenType.tokensOnly) {
                        throw new Error("Wrong token type " + tokenType);
                    }
                    isValidAddress = (0, utils_1.isValidSolanaAddress)(publicAddress);
                    if (!isValidAddress) {
                        return [2 /*return*/, []];
                    }
                    return [4 /*yield*/, connection.getParsedTokenAccountsByOwner(new web3_js_1.PublicKey(publicAddress), {
                            programId: new web3_js_1.PublicKey(solana_1.TOKEN_PROGRAM),
                        })];
                case 1:
                    splAccounts = (_e.sent()).value;
                    tokensList = createTokenObjectsFromSplAccounts(splAccounts, tokenType);
                    tokensSlice = tokensList === null || tokensList === void 0 ? void 0 : tokensList.slice(0, limit);
                    processChunkPromises = (0, lodash_chunk_1.default)(tokensSlice, metaAccountsRequestChunkSize).map(processChunk);
                    return [4 /*yield*/, Promise.allSettled(processChunkPromises)];
                case 2:
                    settledChunkPromises = _e.sent();
                    accountsRawMeta = settledChunkPromises
                        .filter(function (_a) {
                        var status = _a.status;
                        return status === "fulfilled";
                    })
                        .flatMap(function (p) { return p.value; });
                    return [2 /*return*/, (0, lodash_orderby_1.default)(accountsRawMeta, [sortKeys.updateAuthority], ["asc"])];
            }
        });
    });
};
exports.getParsedTokenAccountsByOwner = getParsedTokenAccountsByOwner;
function sanitizeTokenMeta(tokenData) {
    var _a, _b, _c;
    return __assign(__assign({}, tokenData), { name: sanitizeMetaStrings((_a = tokenData === null || tokenData === void 0 ? void 0 : tokenData.name) !== null && _a !== void 0 ? _a : ""), symbol: sanitizeMetaStrings((_b = tokenData === null || tokenData === void 0 ? void 0 : tokenData.symbol) !== null && _b !== void 0 ? _b : ""), uri: sanitizeMetaStrings((_c = tokenData === null || tokenData === void 0 ? void 0 : tokenData.uri) !== null && _c !== void 0 ? _c : "") });
}
// Remove all empty space, new line, etc. symbols
// In some reason such symbols parsed back from Buffer looks weird
// like "\x0000" instead of usual spaces.
function sanitizeMetaStrings(metaString) {
    return metaString.replace(/\0/g, "");
}
function onlySuccessfullPromises(result) {
    return result && result.status === "fulfilled";
}
//# sourceMappingURL=getParsedTokenAccountsByOwner.js.map
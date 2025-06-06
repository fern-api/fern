"use strict";
/**
 * This file was auto-generated by Fern from our API Definition.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedApiClient = void 0;
const Client_1 = require("./api/resources/imdb/client/Client");
class SeedApiClient {
    constructor(_options) {
        this._options = _options;
    }
    get imdb() {
        var _a;
        return ((_a = this._imdb) !== null && _a !== void 0 ? _a : (this._imdb = new Client_1.Imdb(this._options)));
    }
}
exports.SeedApiClient = SeedApiClient;

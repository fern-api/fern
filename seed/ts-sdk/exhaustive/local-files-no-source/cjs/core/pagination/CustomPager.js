"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomPager = void 0;
exports.createCustomPager = createCustomPager;
/**
 *
 * @template TItem The type of the items in the page.
 * @template TResponse The type of the API response.
 */
class CustomPager {
    constructor(args) {
        this.response = args.response;
        this.rawResponse = args.rawResponse;
        this.data = args.items;
        this._hasNextPage = args.hasNextPage;
        this._hasPreviousPage = args.hasPreviousPage;
        this.nextRequest = args.nextRequest;
        this.previousRequest = args.previousRequest;
        this.sendRequest = args.sendRequest;
    }
    /**
     * @returns whether there is a next page to load
     */
    hasNextPage() {
        return this._hasNextPage;
    }
    /**
     * @returns whether there is a previous page to load
     */
    hasPreviousPage() {
        return this._hasPreviousPage;
    }
    /**
     * Returns the current page data.
     * This is an alias for the `data` property for consistency with other pagination APIs.
     *
     * @returns the items from the current page
     */
    getCurrentPage() {
        return this.data;
    }
    /**
     * Retrieves the next page of results.
     * @returns this pager with updated data
     * @throws Error if there is no next page
     */
    getNextPage() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._hasNextPage || !this.nextRequest) {
                throw new Error("No next page available");
            }
            const response = yield this.sendRequest(this.nextRequest);
            if (!response.ok) {
                const reason = response.error.reason === "status-code" ? `HTTP ${response.error.statusCode}` : response.error.reason;
                throw new Error(`Failed to fetch next page: ${reason}`);
            }
            const data = response.body;
            const rawResponse = response.rawResponse;
            const parsed = yield parse({ request: this.nextRequest, data, rawResponse });
            this.response = data;
            this.rawResponse = rawResponse;
            this.data = parsed.items;
            this._hasNextPage = parsed.hasNextPage;
            this._hasPreviousPage = parsed.hasPreviousPage;
            this.nextRequest = parsed.nextRequest;
            this.previousRequest = parsed.previousRequest;
            return this;
        });
    }
    /**
     * Retrieves the previous page of results.
     * @returns this pager with updated data
     * @throws Error if there is no previous page
     */
    getPreviousPage() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._hasPreviousPage || !this.previousRequest) {
                throw new Error("No previous page available");
            }
            const response = yield this.sendRequest(this.previousRequest);
            if (!response.ok) {
                const reason = response.error.reason === "status-code" ? `HTTP ${response.error.statusCode}` : response.error.reason;
                throw new Error(`Failed to fetch previous page: ${reason}`);
            }
            const data = response.body;
            const rawResponse = response.rawResponse;
            const parsed = yield parse({ request: this.previousRequest, data, rawResponse });
            this.response = data;
            this.rawResponse = rawResponse;
            this.data = parsed.items;
            this._hasNextPage = parsed.hasNextPage;
            this._hasPreviousPage = parsed.hasPreviousPage;
            this.nextRequest = parsed.nextRequest;
            this.previousRequest = parsed.previousRequest;
            return this;
        });
    }
    iterMessages() {
        return __asyncGenerator(this, arguments, function* iterMessages_1() {
            for (const item of this.data) {
                yield yield __await(item);
            }
            while (this.hasNextPage()) {
                yield __await(this.getNextPage());
                for (const item of this.data) {
                    yield yield __await(item);
                }
            }
        });
    }
    [Symbol.asyncIterator]() {
        return __asyncGenerator(this, arguments, function* _a() {
            var _b, e_1, _c, _d;
            try {
                for (var _e = true, _f = __asyncValues(this.iterMessages()), _g; _g = yield __await(_f.next()), _b = _g.done, !_b; _e = true) {
                    _d = _g.value;
                    _e = false;
                    const message = _d;
                    yield yield __await(message);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_e && !_b && (_c = _f.return)) yield __await(_c.call(_f));
                }
                finally { if (e_1) throw e_1.error; }
            }
        });
    }
}
exports.CustomPager = CustomPager;
function createCustomPager(_a) {
    return __awaiter(this, arguments, void 0, function* ({ sendRequest, initialHttpRequest, clientOptions, }) {
        const response = yield sendRequest(initialHttpRequest);
        if (!response.ok) {
            const reason = response.error.reason === "status-code" ? `HTTP ${response.error.statusCode}` : response.error.reason;
            throw new Error(`Failed to fetch initial page: ${reason}`);
        }
        const data = response.body;
        const rawResponse = response.rawResponse;
        const parsed = yield parse({ request: initialHttpRequest, data, rawResponse });
        return new CustomPager({
            response: data,
            rawResponse,
            items: parsed.items,
            hasNextPage: parsed.hasNextPage,
            hasPreviousPage: parsed.hasPreviousPage,
            nextRequest: parsed.nextRequest,
            previousRequest: parsed.previousRequest,
            sendRequest: sendRequest,
        });
    });
}
function parse(_args) {
    return __awaiter(this, void 0, void 0, function* () {
        // Placeholder implementation.
        // TODO: Replace this with actual parsing logic.
        return {
            items: [],
            hasNextPage: false,
            hasPreviousPage: false,
        };
    });
}

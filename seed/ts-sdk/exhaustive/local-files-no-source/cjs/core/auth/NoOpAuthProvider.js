"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoOpAuthProvider = void 0;
class NoOpAuthProvider {
    getAuthRequest() {
        return Promise.resolve({ headers: {} });
    }
}
exports.NoOpAuthProvider = NoOpAuthProvider;

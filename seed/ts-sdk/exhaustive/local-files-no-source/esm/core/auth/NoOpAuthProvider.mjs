export class NoOpAuthProvider {
    getAuthRequest() {
        return Promise.resolve({ headers: {} });
    }
}

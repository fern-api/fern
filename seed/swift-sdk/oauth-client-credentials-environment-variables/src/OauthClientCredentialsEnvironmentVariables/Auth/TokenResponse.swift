public struct TokenResponse: Codable, Hashable {
    public let accessToken: String
    public let expiresIn: Int
    public let refreshToken: String?

    enum CodingKeys: String, CodingKey {
        case accessToken = "access_token"
        case expiresIn = "expires_in"
        case refreshToken = "refresh_token"
    }
}
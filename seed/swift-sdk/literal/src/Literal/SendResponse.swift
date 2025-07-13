public struct SendResponse: Codable, Hashable {
    public let message: String
    public let status: Int
    public let success: Any
}
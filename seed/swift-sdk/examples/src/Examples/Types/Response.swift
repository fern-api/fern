public struct Response: Codable, Hashable {
    public let response: Any
    public let identifiers: [Identifier]
}
public struct SingleFilterSearchRequest: Codable, Hashable {
    public let field: String?
    public let `operator`: SingleFilterSearchRequestOperator?
    public let value: String?
}
public enum SearchRequestQuery: Codable, Hashable, Sendable {
    case singleFilterSearchRequest(SingleFilterSearchRequest)
    case multipleFilterSearchRequest(MultipleFilterSearchRequest)

    public init() throws {
    }

    public func encode() throws -> Void {
    }
}
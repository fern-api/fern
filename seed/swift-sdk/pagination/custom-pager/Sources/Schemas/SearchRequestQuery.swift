public enum SearchRequestQuery: Codable, Hashable, Sendable {
    case singleFilterSearchRequest(SingleFilterSearchRequest)
    case multipleFilterSearchRequest(MultipleFilterSearchRequest)

    public init() throws {
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.singleValueContainer()
        switch self {
        case .singleFilterSearchRequest(let value):
            try container.encode(value)
        case .multipleFilterSearchRequest(let value):
            try container.encode(value)
        }
    }
}
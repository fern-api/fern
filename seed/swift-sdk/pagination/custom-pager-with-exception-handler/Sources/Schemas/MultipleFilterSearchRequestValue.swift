public enum MultipleFilterSearchRequestValue: Codable, Hashable, Sendable {
    case multipleFilterSearchRequestArray([MultipleFilterSearchRequest])
    case singleFilterSearchRequestArray([SingleFilterSearchRequest])

    public init() throws {
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.singleValueContainer()
        switch self {
        case .multipleFilterSearchRequestArray(let value):
            try container.encode(value)
        case .singleFilterSearchRequestArray(let value):
            try container.encode(value)
        }
    }
}
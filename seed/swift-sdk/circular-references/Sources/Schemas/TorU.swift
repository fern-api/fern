public enum TorU: Codable, Hashable, Sendable {
    case t(T)
    case u(U)

    public init() throws {
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.singleValueContainer()
        switch self {
        case .t(let value):
            try container.encode(value)
        case .u(let value):
            try container.encode(value)
        }
    }
}
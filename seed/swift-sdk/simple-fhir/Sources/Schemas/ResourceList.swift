public enum ResourceList: Codable, Hashable, Sendable {
    case account(Account)
    case patient(Patient)
    case practitioner(Practitioner)
    case script(Script)

    public init() throws {
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.singleValueContainer()
        switch self {
        case .account(let value):
            try container.encode(value)
        case .patient(let value):
            try container.encode(value)
        case .practitioner(let value):
            try container.encode(value)
        case .script(let value):
            try container.encode(value)
        }
    }
}
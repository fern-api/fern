import Foundation

public indirect enum ResourceList: Codable, Hashable, Sendable {
    case account(Account)
    case patient(Patient)
    case practitioner(Practitioner)
    case script(Script)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(Account.self) {
            self = .account(value)
        } else if let value = try? container.decode(Patient.self) {
            self = .patient(value)
        } else if let value = try? container.decode(Practitioner.self) {
            self = .practitioner(value)
        } else if let value = try? container.decode(Script.self) {
            self = .script(value)
        } else {
            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Unexpected value."
            )
        }
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
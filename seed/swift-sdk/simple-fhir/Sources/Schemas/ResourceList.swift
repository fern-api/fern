import Foundation

public indirect enum ResourceList: Codable, Hashable, Sendable {
    case account(Account)
    case patient(Patient)
    case practitioner(Practitioner)
    case script(Script)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .resourceType)
        switch discriminant {
        case "Account":
            self = .account(try Account(from: decoder))
        case "Patient":
            self = .patient(try Patient(from: decoder))
        case "Practitioner":
            self = .practitioner(try Practitioner(from: decoder))
        case "Script":
            self = .script(try Script(from: decoder))
        default:
            throw DecodingError.dataCorrupted(
                DecodingError.Context(
                    codingPath: decoder.codingPath,
                    debugDescription: "Unknown shape discriminant value: \(discriminant)"
                )
            )
        }
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        switch self {
        case .account(let data):
            try container.encode("Account", forKey: .resourceType)
            try data.encode(to: encoder)
        case .patient(let data):
            try container.encode("Patient", forKey: .resourceType)
            try data.encode(to: encoder)
        case .practitioner(let data):
            try container.encode("Practitioner", forKey: .resourceType)
            try data.encode(to: encoder)
        case .script(let data):
            try container.encode("Script", forKey: .resourceType)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case resourceType = "resource_type"
    }
}
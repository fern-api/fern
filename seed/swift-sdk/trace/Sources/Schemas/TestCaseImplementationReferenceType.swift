import Foundation

public enum TestCaseImplementationReferenceType: Codable, Hashable, Sendable {
    case implementation(TestCaseImplementationType)
    case templateId(TestCaseTemplateIdType)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "implementation":
            self = .implementation(try TestCaseImplementationType(from: decoder))
        case "templateId":
            self = .templateId(try container.decode(TestCaseTemplateIdType.self, forKey: .value))
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
        case .implementation(let data):
            try container.encode("implementation", forKey: .type)
            try data.encode(to: encoder)
        case .templateId(let data):
            try container.encode("templateId", forKey: .type)
            try container.encode(data, forKey: .value)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case value
    }
}
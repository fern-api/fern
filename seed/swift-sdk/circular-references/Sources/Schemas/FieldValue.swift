import Foundation

public indirect enum FieldValue: Codable, Hashable, Sendable {
    case containerValue(ContainerValue)
    case objectValue(ObjectValue)
    case primitiveValue(PrimitiveValue)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "container_value":
            self = .containerValue(try container.decode(ContainerValue.self, forKey: .value))
        case "object_value":
            self = .objectValue(try ObjectValue(from: decoder))
        case "primitive_value":
            self = .primitiveValue(try container.decode(PrimitiveValue.self, forKey: .value))
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
        case .containerValue(let data):
            try container.encode("container_value", forKey: .type)
            try container.encode(data, forKey: .value)
        case .objectValue(let data):
            try container.encode("object_value", forKey: .type)
            try data.encode(to: encoder)
        case .primitiveValue(let data):
            try container.encode("primitive_value", forKey: .type)
            try container.encode(data, forKey: .value)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case value
    }
}
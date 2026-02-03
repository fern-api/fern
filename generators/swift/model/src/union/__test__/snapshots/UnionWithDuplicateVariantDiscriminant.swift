public enum UnionWithDuplicateVariantDiscriminant: Codable, Hashable, Sendable {
    case variantA(VariantA)
    case variantB(VariantB)
    case variantC(VariantC)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "variantA":
            self = .variantA(try VariantA(from: decoder))
        case "variantB":
            self = .variantB(try VariantB(from: decoder))
        case "variantC":
            self = .variantC(try VariantC(from: decoder))
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
        switch self {
        case .variantA(let data):
            var container = encoder.container(keyedBy: CodingKeys.self)
            try container.encode("variantA", forKey: .type)
            try data.encode(to: encoder)
        case .variantB(let data):
            var container = encoder.container(keyedBy: CodingKeys.self)
            try container.encode("variantB", forKey: .type)
            try data.encode(to: encoder)
        case .variantC(let data):
            var container = encoder.container(keyedBy: CodingKeys.self)
            try container.encode("variantC", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}
public enum CustomDiscriminantObjectUnion: Codable, Hashable, Sendable {
    case cat(Cat)
    case dog(Dog)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .animalType)
        switch discriminant {
        case "cat":
            self = .cat(try Cat(from: decoder))
        case "dog":
            self = .dog(try Dog(from: decoder))
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
        case .cat(let data):
            try container.encode("cat", forKey: .animalType)
            try data.encode(to: encoder)
        case .dog(let data):
            try container.encode("dog", forKey: .animalType)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case animalType = "animal_type"
    }
}
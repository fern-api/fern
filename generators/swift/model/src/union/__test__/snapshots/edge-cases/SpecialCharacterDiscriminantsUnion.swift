public enum SpecialCharacterDiscriminantsUnion: Codable, Hashable, Sendable {
    case abc(UnionVariant)
    case abcdEfgh(UnionVariant)
    case camelCase(UnionVariant)
    case dataPoint(UnionVariant)
    case kebabCaseValue(UnionVariant)
    case leadingSpaces(UnionVariant)
    case mixed123Values456(UnionVariant)
    case oneAbc(UnionVariant)
    case oneHundredTwentyThreeAbc(UnionVariant)
    case pascalCase(UnionVariant)
    case sevenAgent(UnionVariant)
    case snakeCaseValue(UnionVariant)
    case spacesInTheMiddle(UnionVariant)
    case special(UnionVariant)
    case trailingSpaces(UnionVariant)
    case twelveAbc(UnionVariant)
    case uppercase(UnionVariant)
    case userName(UnionVariant)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "abc":
            self = .abc(try UnionVariant(from: decoder))
        case "abcd-efgh":
            self = .abcdEfgh(try UnionVariant(from: decoder))
        case "camelCase":
            self = .camelCase(try UnionVariant(from: decoder))
        case "data@point":
            self = .dataPoint(try UnionVariant(from: decoder))
        case "kebab-case-value":
            self = .kebabCaseValue(try UnionVariant(from: decoder))
        case "  leading-spaces":
            self = .leadingSpaces(try UnionVariant(from: decoder))
        case "mixed123Values456":
            self = .mixed123Values456(try UnionVariant(from: decoder))
        case "1abc":
            self = .oneAbc(try UnionVariant(from: decoder))
        case "123abc":
            self = .oneHundredTwentyThreeAbc(try UnionVariant(from: decoder))
        case "PascalCase":
            self = .pascalCase(try UnionVariant(from: decoder))
        case "007agent":
            self = .sevenAgent(try UnionVariant(from: decoder))
        case "snake_case_value":
            self = .snakeCaseValue(try UnionVariant(from: decoder))
        case "spaces in the middle":
            self = .spacesInTheMiddle(try UnionVariant(from: decoder))
        case "!@#$%special":
            self = .special(try UnionVariant(from: decoder))
        case "trailing-spaces ":
            self = .trailingSpaces(try UnionVariant(from: decoder))
        case "12abc":
            self = .twelveAbc(try UnionVariant(from: decoder))
        case "UPPERCASE":
            self = .uppercase(try UnionVariant(from: decoder))
        case "user#name":
            self = .userName(try UnionVariant(from: decoder))
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
        case .abc(let data):
            try container.encode("abc", forKey: .type)
            try data.encode(to: encoder)
        case .abcdEfgh(let data):
            try container.encode("abcd-efgh", forKey: .type)
            try data.encode(to: encoder)
        case .camelCase(let data):
            try container.encode("camelCase", forKey: .type)
            try data.encode(to: encoder)
        case .dataPoint(let data):
            try container.encode("data@point", forKey: .type)
            try data.encode(to: encoder)
        case .kebabCaseValue(let data):
            try container.encode("kebab-case-value", forKey: .type)
            try data.encode(to: encoder)
        case .leadingSpaces(let data):
            try container.encode("  leading-spaces", forKey: .type)
            try data.encode(to: encoder)
        case .mixed123Values456(let data):
            try container.encode("mixed123Values456", forKey: .type)
            try data.encode(to: encoder)
        case .oneAbc(let data):
            try container.encode("1abc", forKey: .type)
            try data.encode(to: encoder)
        case .oneHundredTwentyThreeAbc(let data):
            try container.encode("123abc", forKey: .type)
            try data.encode(to: encoder)
        case .pascalCase(let data):
            try container.encode("PascalCase", forKey: .type)
            try data.encode(to: encoder)
        case .sevenAgent(let data):
            try container.encode("007agent", forKey: .type)
            try data.encode(to: encoder)
        case .snakeCaseValue(let data):
            try container.encode("snake_case_value", forKey: .type)
            try data.encode(to: encoder)
        case .spacesInTheMiddle(let data):
            try container.encode("spaces in the middle", forKey: .type)
            try data.encode(to: encoder)
        case .special(let data):
            try container.encode("!@#$%special", forKey: .type)
            try data.encode(to: encoder)
        case .trailingSpaces(let data):
            try container.encode("trailing-spaces ", forKey: .type)
            try data.encode(to: encoder)
        case .twelveAbc(let data):
            try container.encode("12abc", forKey: .type)
            try data.encode(to: encoder)
        case .uppercase(let data):
            try container.encode("UPPERCASE", forKey: .type)
            try data.encode(to: encoder)
        case .userName(let data):
            try container.encode("user#name", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}
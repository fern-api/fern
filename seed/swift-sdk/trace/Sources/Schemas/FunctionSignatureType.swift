public enum FunctionSignatureType: Codable, Hashable, Sendable {
    case void(Void)
    case nonVoid(NonVoid)
    case voidThatTakesActualResult(VoidThatTakesActualResult)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "void":
            self = .void(try Void(from: decoder))
        case "nonVoid":
            self = .nonVoid(try NonVoid(from: decoder))
        case "voidThatTakesActualResult":
            self = .voidThatTakesActualResult(try VoidThatTakesActualResult(from: decoder))
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
        case .void(let data):
            try data.encode(to: encoder)
        case .nonVoid(let data):
            try data.encode(to: encoder)
        case .voidThatTakesActualResult(let data):
            try data.encode(to: encoder)
        }
    }

    public struct Void: Codable, Hashable, Sendable {
        public let type: String = "void"
        public let parameters: [ParameterType]
        public let additionalProperties: [String: JSONValue]

        public init(
            parameters: [ParameterType],
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.parameters = parameters
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.parameters = try container.decode([ParameterType].self, forKey: .parameters)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.parameters, forKey: .parameters)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case parameters
        }
    }

    public struct NonVoid: Codable, Hashable, Sendable {
        public let type: String = "nonVoid"
        public let parameters: [ParameterType]
        public let returnType: VariableType
        public let additionalProperties: [String: JSONValue]

        public init(
            parameters: [ParameterType],
            returnType: VariableType,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.parameters = parameters
            self.returnType = returnType
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.parameters = try container.decode([ParameterType].self, forKey: .parameters)
            self.returnType = try container.decode(VariableType.self, forKey: .returnType)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.parameters, forKey: .parameters)
            try container.encode(self.returnType, forKey: .returnType)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case parameters
            case returnType
        }
    }

    public struct VoidThatTakesActualResult: Codable, Hashable, Sendable {
        public let type: String = "voidThatTakesActualResult"
        public let parameters: [ParameterType]
        public let actualResultType: VariableType
        public let additionalProperties: [String: JSONValue]

        public init(
            parameters: [ParameterType],
            actualResultType: VariableType,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.parameters = parameters
            self.actualResultType = actualResultType
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.parameters = try container.decode([ParameterType].self, forKey: .parameters)
            self.actualResultType = try container.decode(VariableType.self, forKey: .actualResultType)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.parameters, forKey: .parameters)
            try container.encode(self.actualResultType, forKey: .actualResultType)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case parameters
            case actualResultType
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}
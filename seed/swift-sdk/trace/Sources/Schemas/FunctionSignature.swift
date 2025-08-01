public enum FunctionSignature: Codable, Hashable, Sendable {
    case void(Void)
    case nonVoid(NonVoid)
    case voidThatTakesActualResult(VoidThatTakesActualResult)

    public struct Void: Codable, Hashable, Sendable {
        public let type: String = "void"
        public let parameters: [Parameter]
        public let additionalProperties: [String: JSONValue]
        public let _additionalProperties: [String: JSONValue]

        public init(
            parameters: [Parameter],
            additionalProperties: [String: JSONValue],
            _additionalProperties: [String: JSONValue] = .init()
        ) {
            self.parameters = parameters
            self.additionalProperties = additionalProperties
            self._additionalProperties = _additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.parameters = try container.decode([Parameter].self, forKey: .parameters)
            self.additionalProperties = try container.decode([String: JSONValue].self, forKey: .additionalProperties)
            self._additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self._additionalProperties)
            try container.encode(self.parameters, forKey: .parameters)
            try container.encode(self.additionalProperties, forKey: .additionalProperties)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case parameters = "placeholder"
            case additionalProperties = "placeholder"
        }
    }

    public struct NonVoid: Codable, Hashable, Sendable {
        public let type: String = "nonVoid"
        public let parameters: [Parameter]
        public let returnType: VariableType
        public let additionalProperties: [String: JSONValue]
        public let _additionalProperties: [String: JSONValue]

        public init(
            parameters: [Parameter],
            returnType: VariableType,
            additionalProperties: [String: JSONValue],
            _additionalProperties: [String: JSONValue] = .init()
        ) {
            self.parameters = parameters
            self.returnType = returnType
            self.additionalProperties = additionalProperties
            self._additionalProperties = _additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.parameters = try container.decode([Parameter].self, forKey: .parameters)
            self.returnType = try container.decode(VariableType.self, forKey: .returnType)
            self.additionalProperties = try container.decode([String: JSONValue].self, forKey: .additionalProperties)
            self._additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self._additionalProperties)
            try container.encode(self.parameters, forKey: .parameters)
            try container.encode(self.returnType, forKey: .returnType)
            try container.encode(self.additionalProperties, forKey: .additionalProperties)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case parameters = "placeholder"
            case returnType = "placeholder"
            case additionalProperties = "placeholder"
        }
    }

    public struct VoidThatTakesActualResult: Codable, Hashable, Sendable {
        public let type: String = "voidThatTakesActualResult"
        public let parameters: [Parameter]
        public let actualResultType: VariableType
        public let additionalProperties: [String: JSONValue]
        public let _additionalProperties: [String: JSONValue]

        public init(
            parameters: [Parameter],
            actualResultType: VariableType,
            additionalProperties: [String: JSONValue],
            _additionalProperties: [String: JSONValue] = .init()
        ) {
            self.parameters = parameters
            self.actualResultType = actualResultType
            self.additionalProperties = additionalProperties
            self._additionalProperties = _additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.parameters = try container.decode([Parameter].self, forKey: .parameters)
            self.actualResultType = try container.decode(VariableType.self, forKey: .actualResultType)
            self.additionalProperties = try container.decode([String: JSONValue].self, forKey: .additionalProperties)
            self._additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self._additionalProperties)
            try container.encode(self.parameters, forKey: .parameters)
            try container.encode(self.actualResultType, forKey: .actualResultType)
            try container.encode(self.additionalProperties, forKey: .additionalProperties)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case parameters = "placeholder"
            case actualResultType = "placeholder"
            case additionalProperties = "placeholder"
        }
    }
}
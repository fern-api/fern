public enum FunctionSignature: Codable, Hashable, Sendable {
    case void(Void)
    case nonVoid(NonVoid)
    case voidThatTakesActualResult(VoidThatTakesActualResult)

    public struct Void: Codable, Hashable, Sendable {
        public let type: String = "void"
        public let parameters: [Parameter]
        public let additionalProperties: [String: JSONValue]

        public init(type: String, parameters: [Parameter], additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct NonVoid: Codable, Hashable, Sendable {
        public let type: String = "nonVoid"
        public let parameters: [Parameter]
        public let returnType: VariableType
        public let additionalProperties: [String: JSONValue]

        public init(type: String, parameters: [Parameter], returnType: VariableType, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct VoidThatTakesActualResult: Codable, Hashable, Sendable {
        public let type: String = "voidThatTakesActualResult"
        public let parameters: [Parameter]
        public let actualResultType: VariableType
        public let additionalProperties: [String: JSONValue]

        public init(type: String, parameters: [Parameter], actualResultType: VariableType, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}
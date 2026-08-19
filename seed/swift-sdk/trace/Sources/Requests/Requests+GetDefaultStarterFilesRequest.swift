import Foundation

extension Requests {
    public struct GetDefaultStarterFilesRequest: Codable, Hashable, Sendable {
        public let inputParams: [VariableTypeAndName]
        public let outputType: VariableType
        /// The name of the `method` that the student has to complete.
        /// The method name cannot include the following characters:
        ///   - Greater Than `>`
        ///   - Less Than `<``
        ///   - Equals `=`
        ///   - Period `.`
        public let methodName: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            inputParams: [VariableTypeAndName],
            outputType: VariableType,
            methodName: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.inputParams = inputParams
            self.outputType = outputType
            self.methodName = methodName
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.inputParams = try container.decode([VariableTypeAndName].self, forKey: .inputParams)
            self.outputType = try container.decode(VariableType.self, forKey: .outputType)
            self.methodName = try container.decode(String.self, forKey: .methodName)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.inputParams, forKey: .inputParams)
            try container.encode(self.outputType, forKey: .outputType)
            try container.encode(self.methodName, forKey: .methodName)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case inputParams
            case outputType
            case methodName
        }
    }
}
public struct SendEnumInlinedRequest: Codable, Hashable, Sendable {
    public let operand: Operand
    public let maybeOperand: Operand?
    public let operandOrColor: ColorOrOperand
    public let maybeOperandOrColor: ColorOrOperand?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        operand: Operand,
        maybeOperand: Operand? = nil,
        operandOrColor: ColorOrOperand,
        maybeOperandOrColor: ColorOrOperand? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.operand = operand
        self.maybeOperand = maybeOperand
        self.operandOrColor = operandOrColor
        self.maybeOperandOrColor = maybeOperandOrColor
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.operand = try container.decode(Operand.self, forKey: .operand)
        self.maybeOperand = try container.decodeIfPresent(Operand.self, forKey: .maybeOperand)
        self.operandOrColor = try container.decode(ColorOrOperand.self, forKey: .operandOrColor)
        self.maybeOperandOrColor = try container.decodeIfPresent(ColorOrOperand.self, forKey: .maybeOperandOrColor)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.operand, forKey: .operand)
        try container.encodeIfPresent(self.maybeOperand, forKey: .maybeOperand)
        try container.encode(self.operandOrColor, forKey: .operandOrColor)
        try container.encodeIfPresent(self.maybeOperandOrColor, forKey: .maybeOperandOrColor)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case operand
        case maybeOperand
        case operandOrColor
        case maybeOperandOrColor
    }
}
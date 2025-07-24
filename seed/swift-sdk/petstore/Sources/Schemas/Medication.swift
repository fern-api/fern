public struct Medication: Codable, Hashable {
    public let administrationMethod: String?
    public let dosage: String
    public let frequency: String
    public let medicationName: String
    public let specialInstructions: String?
    public let additionalProperties: [String: JSONValue]

    public init(administrationMethod: String? = nil, dosage: String, frequency: String, medicationName: String, specialInstructions: String? = nil, additionalProperties: [String: JSONValue] = .init()) {
        self.administrationMethod = administrationMethod
        self.dosage = dosage
        self.frequency = frequency
        self.medicationName = medicationName
        self.specialInstructions = specialInstructions
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.administrationMethod = try container.decodeIfPresent(String.self, forKey: .administrationMethod)
        self.dosage = try container.decode(String.self, forKey: .dosage)
        self.frequency = try container.decode(String.self, forKey: .frequency)
        self.medicationName = try container.decode(String.self, forKey: .medicationName)
        self.specialInstructions = try container.decodeIfPresent(String.self, forKey: .specialInstructions)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.administrationMethod, forKey: .administrationMethod)
        try container.encode(self.dosage, forKey: .dosage)
        try container.encode(self.frequency, forKey: .frequency)
        try container.encode(self.medicationName, forKey: .medicationName)
        try container.encodeIfPresent(self.specialInstructions, forKey: .specialInstructions)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case administrationMethod = "administration_method"
        case dosage
        case frequency
        case medicationName = "medication_name"
        case specialInstructions = "special_instructions"
    }
}
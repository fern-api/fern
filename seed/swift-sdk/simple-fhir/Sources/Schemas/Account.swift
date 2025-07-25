public struct Account: Codable, Hashable {
    public let resourceType: Any
    public let name: String
    public let patient: Patient?
    public let practitioner: Practitioner?
    public let additionalProperties: [String: JSONValue]

    public init(
        resourceType: Any,
        name: String,
        patient: Patient? = nil,
        practitioner: Practitioner? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.resourceType = resourceType
        self.name = name
        self.patient = patient
        self.practitioner = practitioner
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.resourceType = try container.decode(Any.self, forKey: .resourceType)
        self.name = try container.decode(String.self, forKey: .name)
        self.patient = try container.decodeIfPresent(Patient.self, forKey: .patient)
        self.practitioner = try container.decodeIfPresent(Practitioner.self, forKey: .practitioner)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.resourceType, forKey: .resourceType)
        try container.encode(self.name, forKey: .name)
        try container.encodeIfPresent(self.patient, forKey: .patient)
        try container.encodeIfPresent(self.practitioner, forKey: .practitioner)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case resourceType = "resource_type"
        case name
        case patient
        case practitioner
    }
}
public struct Account: Codable, Hashable, Sendable {
    public let id: String
    public let relatedResources: [ResourceList]
    public let memo: Memo
    public let resourceType: JSONValue
    public let name: String
    public let patient: Patient?
    public let practitioner: Practitioner?
    public let additionalProperties: [String: JSONValue]

    public init(
        id: String,
        relatedResources: [ResourceList],
        memo: Memo,
        resourceType: JSONValue,
        name: String,
        patient: Patient? = nil,
        practitioner: Practitioner? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.id = id
        self.relatedResources = relatedResources
        self.memo = memo
        self.resourceType = resourceType
        self.name = name
        self.patient = patient
        self.practitioner = practitioner
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(String.self, forKey: .id)
        self.relatedResources = try container.decode([ResourceList].self, forKey: .relatedResources)
        self.memo = try container.decode(Memo.self, forKey: .memo)
        self.resourceType = try container.decode(JSONValue.self, forKey: .resourceType)
        self.name = try container.decode(String.self, forKey: .name)
        self.patient = try container.decodeIfPresent(Patient.self, forKey: .patient)
        self.practitioner = try container.decodeIfPresent(Practitioner.self, forKey: .practitioner)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.id, forKey: .id)
        try container.encode(self.relatedResources, forKey: .relatedResources)
        try container.encode(self.memo, forKey: .memo)
        try container.encode(self.resourceType, forKey: .resourceType)
        try container.encode(self.name, forKey: .name)
        try container.encodeIfPresent(self.patient, forKey: .patient)
        try container.encodeIfPresent(self.practitioner, forKey: .practitioner)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case id
        case relatedResources = "related_resources"
        case memo
        case resourceType = "resource_type"
        case name
        case patient
        case practitioner
    }
}
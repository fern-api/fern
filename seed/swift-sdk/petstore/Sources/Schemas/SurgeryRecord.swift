public struct SurgeryRecord: Codable, Hashable {
    public let anesthesiaUsed: String?
    public let createdAt: Date
    public let id: Int64?
    public let notes: String?
    public let petId: Int64
    public let postOpMedications: [String]?
    public let procedureName: String
    public let recoveryNotes: String?
    public let surgeryDate: Date
    public let surgeryDurationMinutes: Int?
    public let updatedAt: Date?
    public let urgencyLevel: UrgencyLevel?
    public let veterinarianId: Int64
    public let additionalProperties: [String: JSONValue]

    public init(anesthesiaUsed: String? = nil, createdAt: Date, id: Int64? = nil, notes: String? = nil, petId: Int64, postOpMedications: [String]? = nil, procedureName: String, recoveryNotes: String? = nil, surgeryDate: Date, surgeryDurationMinutes: Int? = nil, updatedAt: Date? = nil, urgencyLevel: UrgencyLevel? = nil, veterinarianId: Int64, additionalProperties: [String: JSONValue] = .init()) {
        self.anesthesiaUsed = anesthesiaUsed
        self.createdAt = createdAt
        self.id = id
        self.notes = notes
        self.petId = petId
        self.postOpMedications = postOpMedications
        self.procedureName = procedureName
        self.recoveryNotes = recoveryNotes
        self.surgeryDate = surgeryDate
        self.surgeryDurationMinutes = surgeryDurationMinutes
        self.updatedAt = updatedAt
        self.urgencyLevel = urgencyLevel
        self.veterinarianId = veterinarianId
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.anesthesiaUsed = try container.decodeIfPresent(String.self, forKey: .anesthesiaUsed)
        self.createdAt = try container.decode(Date.self, forKey: .createdAt)
        self.id = try container.decodeIfPresent(Int64.self, forKey: .id)
        self.notes = try container.decodeIfPresent(String.self, forKey: .notes)
        self.petId = try container.decode(Int64.self, forKey: .petId)
        self.postOpMedications = try container.decodeIfPresent([String].self, forKey: .postOpMedications)
        self.procedureName = try container.decode(String.self, forKey: .procedureName)
        self.recoveryNotes = try container.decodeIfPresent(String.self, forKey: .recoveryNotes)
        self.surgeryDate = try container.decode(Date.self, forKey: .surgeryDate)
        self.surgeryDurationMinutes = try container.decodeIfPresent(Int.self, forKey: .surgeryDurationMinutes)
        self.updatedAt = try container.decodeIfPresent(Date.self, forKey: .updatedAt)
        self.urgencyLevel = try container.decodeIfPresent(UrgencyLevel.self, forKey: .urgencyLevel)
        self.veterinarianId = try container.decode(Int64.self, forKey: .veterinarianId)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.anesthesiaUsed, forKey: .anesthesiaUsed)
        try container.encode(self.createdAt, forKey: .createdAt)
        try container.encodeIfPresent(self.id, forKey: .id)
        try container.encodeIfPresent(self.notes, forKey: .notes)
        try container.encode(self.petId, forKey: .petId)
        try container.encodeIfPresent(self.postOpMedications, forKey: .postOpMedications)
        try container.encode(self.procedureName, forKey: .procedureName)
        try container.encodeIfPresent(self.recoveryNotes, forKey: .recoveryNotes)
        try container.encode(self.surgeryDate, forKey: .surgeryDate)
        try container.encodeIfPresent(self.surgeryDurationMinutes, forKey: .surgeryDurationMinutes)
        try container.encodeIfPresent(self.updatedAt, forKey: .updatedAt)
        try container.encodeIfPresent(self.urgencyLevel, forKey: .urgencyLevel)
        try container.encode(self.veterinarianId, forKey: .veterinarianId)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case anesthesiaUsed = "anesthesia_used"
        case createdAt = "created_at"
        case id
        case notes
        case petId = "pet_id"
        case postOpMedications = "post_op_medications"
        case procedureName = "procedure_name"
        case recoveryNotes = "recovery_notes"
        case surgeryDate = "surgery_date"
        case surgeryDurationMinutes = "surgery_duration_minutes"
        case updatedAt = "updated_at"
        case urgencyLevel = "urgency_level"
        case veterinarianId = "veterinarian_id"
    }
}
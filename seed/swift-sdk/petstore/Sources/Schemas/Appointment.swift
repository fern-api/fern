public struct Appointment: Codable, Hashable {
    public let appointmentDate: Date
    public let appointmentStatus: AppointmentStatus
    public let createdAt: Date?
    public let estimatedDurationMinutes: Int?
    public let id: Int64?
    public let petId: Int64
    public let reasonForVisit: String?
    public let specialInstructions: String?
    public let updatedAt: Date?
    public let urgencyLevel: UrgencyLevel?
    public let veterinarianId: Int64
    public let additionalProperties: [String: JSONValue]

    public init(appointmentDate: Date, appointmentStatus: AppointmentStatus, createdAt: Date? = nil, estimatedDurationMinutes: Int? = nil, id: Int64? = nil, petId: Int64, reasonForVisit: String? = nil, specialInstructions: String? = nil, updatedAt: Date? = nil, urgencyLevel: UrgencyLevel? = nil, veterinarianId: Int64, additionalProperties: [String: JSONValue] = .init()) {
        self.appointmentDate = appointmentDate
        self.appointmentStatus = appointmentStatus
        self.createdAt = createdAt
        self.estimatedDurationMinutes = estimatedDurationMinutes
        self.id = id
        self.petId = petId
        self.reasonForVisit = reasonForVisit
        self.specialInstructions = specialInstructions
        self.updatedAt = updatedAt
        self.urgencyLevel = urgencyLevel
        self.veterinarianId = veterinarianId
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.appointmentDate = try container.decode(Date.self, forKey: .appointmentDate)
        self.appointmentStatus = try container.decode(AppointmentStatus.self, forKey: .appointmentStatus)
        self.createdAt = try container.decodeIfPresent(Date.self, forKey: .createdAt)
        self.estimatedDurationMinutes = try container.decodeIfPresent(Int.self, forKey: .estimatedDurationMinutes)
        self.id = try container.decodeIfPresent(Int64.self, forKey: .id)
        self.petId = try container.decode(Int64.self, forKey: .petId)
        self.reasonForVisit = try container.decodeIfPresent(String.self, forKey: .reasonForVisit)
        self.specialInstructions = try container.decodeIfPresent(String.self, forKey: .specialInstructions)
        self.updatedAt = try container.decodeIfPresent(Date.self, forKey: .updatedAt)
        self.urgencyLevel = try container.decodeIfPresent(UrgencyLevel.self, forKey: .urgencyLevel)
        self.veterinarianId = try container.decode(Int64.self, forKey: .veterinarianId)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.appointmentDate, forKey: .appointmentDate)
        try container.encode(self.appointmentStatus, forKey: .appointmentStatus)
        try container.encodeIfPresent(self.createdAt, forKey: .createdAt)
        try container.encodeIfPresent(self.estimatedDurationMinutes, forKey: .estimatedDurationMinutes)
        try container.encodeIfPresent(self.id, forKey: .id)
        try container.encode(self.petId, forKey: .petId)
        try container.encodeIfPresent(self.reasonForVisit, forKey: .reasonForVisit)
        try container.encodeIfPresent(self.specialInstructions, forKey: .specialInstructions)
        try container.encodeIfPresent(self.updatedAt, forKey: .updatedAt)
        try container.encodeIfPresent(self.urgencyLevel, forKey: .urgencyLevel)
        try container.encode(self.veterinarianId, forKey: .veterinarianId)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case appointmentDate = "appointment_date"
        case appointmentStatus = "appointment_status"
        case createdAt = "created_at"
        case estimatedDurationMinutes = "estimated_duration_minutes"
        case id
        case petId = "pet_id"
        case reasonForVisit = "reason_for_visit"
        case specialInstructions = "special_instructions"
        case updatedAt = "updated_at"
        case urgencyLevel = "urgency_level"
        case veterinarianId = "veterinarian_id"
    }
}
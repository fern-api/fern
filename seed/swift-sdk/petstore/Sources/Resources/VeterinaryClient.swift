public final class VeterinaryClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func createMedicalRecord(request: MedicalRecord, requestOptions: RequestOptions? = nil) async throws -> MedicalRecord {
        return try await httpClient.performRequest(
            method: .post,
            path: "/veterinary/medical-records",
            body: request,
            requestOptions: requestOptions,
            responseType: MedicalRecord.self
        )
    }

    public func createVeterinarianInfo(request: VeterinarianInfo, requestOptions: RequestOptions? = nil) async throws -> VeterinarianInfo {
        return try await httpClient.performRequest(
            method: .post,
            path: "/veterinary/veterinarians",
            body: request,
            requestOptions: requestOptions,
            responseType: VeterinarianInfo.self
        )
    }

    public func getAppointmentById(appointmentId: String, requestOptions: RequestOptions? = nil) async throws -> Appointment {
        return try await httpClient.performRequest(
            method: .get,
            path: "/veterinary/appointments/\(appointmentId)",
            requestOptions: requestOptions,
            responseType: Appointment.self
        )
    }

    public func getMedicalRecordsByPetId(petId: String, requestOptions: RequestOptions? = nil) async throws -> [MedicalRecord] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/veterinary/medical-records/\(petId)",
            requestOptions: requestOptions,
            responseType: [MedicalRecord].self
        )
    }

    public func getVeterinarianById(vetId: String, requestOptions: RequestOptions? = nil) async throws -> VeterinarianInfo {
        return try await httpClient.performRequest(
            method: .get,
            path: "/veterinary/veterinarians/\(vetId)",
            requestOptions: requestOptions,
            responseType: VeterinarianInfo.self
        )
    }

    public func scheduleAppointment(request: Appointment, requestOptions: RequestOptions? = nil) async throws -> Appointment {
        return try await httpClient.performRequest(
            method: .post,
            path: "/veterinary/appointments",
            body: request,
            requestOptions: requestOptions,
            responseType: Appointment.self
        )
    }

    public func updateMedicalRecord(recordId: String, request: MedicalRecord, requestOptions: RequestOptions? = nil) async throws -> MedicalRecord {
        return try await httpClient.performRequest(
            method: .put,
            path: "/veterinary/medical-records/\(recordId)",
            body: request,
            requestOptions: requestOptions,
            responseType: MedicalRecord.self
        )
    }
}
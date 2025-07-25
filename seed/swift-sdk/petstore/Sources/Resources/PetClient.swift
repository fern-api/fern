public final class PetClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func addPet(request: Pet, requestOptions: RequestOptions? = nil) async throws -> Pet {
        return try await httpClient.performRequest(
            method: .post,
            path: "/pet",
            body: request,
            requestOptions: requestOptions,
            responseType: Pet.self
        )
    }

    public func deletePet(petId: String, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .delete,
            path: "/pet/\(petId)",
            requestOptions: requestOptions
        )
    }

    public func findPetsByStatus(status: FindPetsByStatusRequestStatus? = nil, requestOptions: RequestOptions? = nil) async throws -> [Pet] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/pet/findByStatus",
            queryParams: [
                "status": status.map { .string($0.rawValue) }
            ],
            requestOptions: requestOptions,
            responseType: [Pet].self
        )
    }

    public func findPetsByTags(tags: String? = nil, requestOptions: RequestOptions? = nil) async throws -> [Pet] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/pet/findByTags",
            queryParams: [
                "tags": tags.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: [Pet].self
        )
    }

    public func getPetById(petId: String, requestOptions: RequestOptions? = nil) async throws -> Pet {
        return try await httpClient.performRequest(
            method: .get,
            path: "/pet/\(petId)",
            requestOptions: requestOptions,
            responseType: Pet.self
        )
    }

    public func updatePet(request: Pet, requestOptions: RequestOptions? = nil) async throws -> Pet {
        return try await httpClient.performRequest(
            method: .put,
            path: "/pet",
            body: request,
            requestOptions: requestOptions,
            responseType: Pet.self
        )
    }

    public func updatePetWithForm(petId: String, name: String? = nil, status: String? = nil, requestOptions: RequestOptions? = nil) async throws -> Pet {
        return try await httpClient.performRequest(
            method: .post,
            path: "/pet/\(petId)",
            queryParams: [
                "name": name.map { .string($0) }, 
                "status": status.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: Pet.self
        )
    }

    public func uploadFile(petId: String, request: Data, requestOptions: RequestOptions? = nil) async throws -> ApiResponse {
        return try await httpClient.performFileUpload(
            method: .post,
            path: "/pet/\(petId)/uploadImage",
            fileData: request,
            requestOptions: requestOptions,
            responseType: ApiResponse.self
        )
    }
}
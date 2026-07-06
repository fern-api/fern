import Foundation

public final class ContactsClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// Creates a new contact. Returns 200 with the contact or 204 with no content.
    ///
    /// ```swift
    /// import Foundation
    /// import Api
    /// 
    /// private func main() async throws {
    ///     let client = ApiClient()
    /// 
    ///     _ = try await client.contacts.create(request: .init(name: "name"))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func create(request: Requests.CreateContactRequest, requestOptions: RequestOptions? = nil) async throws -> Contact? {
        return try await httpClient.performRequest(
            method: .post,
            path: "/contacts",
            body: request,
            requestOptions: requestOptions,
            responseType: Contact?.self
        )
    }

    /// Gets a contact by ID. Returns 200 with the contact.
    ///
    /// ```swift
    /// import Foundation
    /// import Api
    /// 
    /// private func main() async throws {
    ///     let client = ApiClient()
    /// 
    ///     _ = try await client.contacts.get(id: "id")
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func get(id: String, requestOptions: RequestOptions? = nil) async throws -> Contact {
        return try await httpClient.performRequest(
            method: .get,
            path: "/contacts/\(id)",
            requestOptions: requestOptions,
            responseType: Contact.self
        )
    }
}
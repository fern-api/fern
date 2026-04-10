import Foundation

public final class InlinedrequestsClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// POST with custom object in request body, response is an object
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func postwithobjectbodyandresponse(request: Requests.InlinedRequestsPostWithObjectBodyandResponseRequest, requestOptions: RequestOptions? = nil) async throws -> TypesObjectWithOptionalField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/req-bodies/object",
            body: request,
            requestOptions: requestOptions,
            responseType: TypesObjectWithOptionalField.self
        )
    }
}
import Foundation

public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getresource(resourceId: String, requestOptions: RequestOptions? = nil) async throws -> Resource {
        return try await httpClient.performRequest(
            method: .get,
            path: "/resource/\(resourceId)",
            requestOptions: requestOptions,
            responseType: Resource.self
        )
    }

    public func listresources(pageLimit: Int, beforeDate: CalendarDate, requestOptions: RequestOptions? = nil) async throws -> [Resource] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/resource",
            queryParams: [
                "page_limit": .int(pageLimit), 
                "beforeDate": .calendarDate(beforeDate)
            ],
            requestOptions: requestOptions,
            responseType: [Resource].self
        )
    }
}
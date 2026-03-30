import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.bulkUpdateTasks(
        filterAssignedTo: .value("filter_assigned_to"),
        filterIsComplete: .value("filter_is_complete"),
        filterDate: .value("filter_date"),
        fields: "_fields",
        request: .init(
            bulkUpdateTasksRequestAssignedTo: "assigned_to",
            bulkUpdateTasksRequestDate: CalendarDate("2023-01-15")!,
            bulkUpdateTasksRequestIsComplete: true,
            text: "text"
        )
    )
}

try await main()

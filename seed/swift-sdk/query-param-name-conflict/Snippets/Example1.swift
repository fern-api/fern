import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.bulkUpdateTasks(
        assignedTo: .value("assigned_to"),
        isComplete: .value("is_complete"),
        date: .value("date"),
        fields: .value("_fields"),
        request: .init(
            bulkUpdateTasksRequestAssignedTo: .value("assigned_to"),
            bulkUpdateTasksRequestDate: .value(CalendarDate("2023-01-15")!),
            bulkUpdateTasksRequestIsComplete: .value(true),
            text: .value("text")
        )
    )
}

try await main()

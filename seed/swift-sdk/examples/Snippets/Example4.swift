import Examples

let client = SeedExamplesClient(token: "<token>")

private func main() async throws {
    try await client.file.notification.service.getException(
        notificationId: "notificationId"
    )
}

try await main()

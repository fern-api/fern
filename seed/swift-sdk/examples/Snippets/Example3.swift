import Examples

let client = SeedExamplesClient(token: "<token>")

private func main() async throws {
    try await client.file.notification.service.getException(
        notificationId: "notification-hsy129x"
    )
}

try await main()

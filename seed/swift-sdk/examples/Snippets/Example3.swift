import Examples

let client = SeedExamplesClient(token: "<token>")

try await client.file.notification.service.getException(
    notificationId: "notification-hsy129x"
)

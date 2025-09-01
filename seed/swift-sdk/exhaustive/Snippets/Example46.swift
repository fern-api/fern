import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

private func main() async throws {
    try await client.noReqBody.getWithNoRequestBody(

    )
}

try await main()

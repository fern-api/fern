import Foundation
import FileUpload

private func main() async throws {
    let client = FileUploadClient(baseURL: "https://api.fern.com")

    _ = try await client.service.withRefBody(request: .init(
        imageFile: .init(data: Data("".utf8)),
        request: MyObject(
            foo: "bar"
        )
    ))
}

try await main()

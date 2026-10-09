import Foundation
import FileUpload

enum Example2 {
    static func snippet() async throws {
        let client = FileUploadClient(baseURL: "https://api.fern.com")

        _ = try await client.service.withRefBody(request: .init(
            imageFile: .init(data: Data("".utf8)),
            request: MyObject(
                foo: "bar"
            )
        ))
    }
}

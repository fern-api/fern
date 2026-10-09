import Foundation
import FileUpload

enum Example1 {
    static func snippet() async throws {
        let client = FileUploadClient(baseURL: "https://api.fern.com")

        _ = try await client.service.optionalArgs(request: .init(imageFile: .init(data: Data("".utf8))))
    }
}

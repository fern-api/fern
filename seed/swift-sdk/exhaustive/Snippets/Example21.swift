import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpoints.object.getAndReturnEmbeddings(request: EmbeddingsResponse(
        embeddings: EmbeddingsByModel(
            float: [
                [
                    1.1,
                    1.1
                ],
                [
                    1.1,
                    1.1
                ]
            ],
            int8: [
                [
                    1,
                    1
                ],
                [
                    1,
                    1
                ]
            ],
            uint8: [
                [
                    1,
                    1
                ],
                [
                    1,
                    1
                ]
            ],
            base64: [
                "base64",
                "base64"
            ]
        ),
        texts: [
            "texts",
            "texts"
        ]
    ))
}

try await main()

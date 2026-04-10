import Foundation
import Testing
import Api

@Suite("ServiceClient Wire Tests") struct ServiceClientWireTests {
    @Test func getresource1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "userName": "userName",
                  "metadata_tags": [
                    "metadata_tags"
                  ],
                  "EXTRA_PROPERTIES": {
                    "key": "value"
                  },
                  "resource_type": "user"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Resource.resourceZero(
            ResourceZero(
                userName: "userName",
                metadataTags: [
                    "metadata_tags"
                ],
                extraProperties: [
                    "key": "value"
                ],
                resourceType: .user
            )
        )
        let response = try await client.service.getresource(
            resourceId: "ResourceID",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getresource2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "resource_type": "user",
                  "userName": "userName",
                  "metadata_tags": [
                    "metadata_tags",
                    "metadata_tags"
                  ],
                  "EXTRA_PROPERTIES": {
                    "EXTRA_PROPERTIES": "EXTRA_PROPERTIES"
                  }
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Resource.resourceZero(
            ResourceZero(
                resourceType: .user,
                userName: "userName",
                metadataTags: [
                    "metadata_tags",
                    "metadata_tags"
                ],
                extraProperties: [
                    "EXTRA_PROPERTIES": "EXTRA_PROPERTIES"
                ]
            )
        )
        let response = try await client.service.getresource(
            resourceId: "ResourceID",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listresources1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "userName": "userName",
                    "metadata_tags": [
                      "metadata_tags"
                    ],
                    "EXTRA_PROPERTIES": {
                      "key": "value"
                    },
                    "resource_type": "user"
                  }
                ]
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            Resource.resourceZero(
                ResourceZero(
                    userName: "userName",
                    metadataTags: [
                        "metadata_tags"
                    ],
                    extraProperties: [
                        "key": "value"
                    ],
                    resourceType: .user
                )
            )
        ]
        let response = try await client.service.listresources(
            pageLimit: 1,
            beforeDate: CalendarDate("2023-01-15")!,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listresources2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "resource_type": "user",
                    "userName": "userName",
                    "metadata_tags": [
                      "metadata_tags",
                      "metadata_tags"
                    ],
                    "EXTRA_PROPERTIES": {
                      "EXTRA_PROPERTIES": "EXTRA_PROPERTIES"
                    }
                  },
                  {
                    "resource_type": "user",
                    "userName": "userName",
                    "metadata_tags": [
                      "metadata_tags",
                      "metadata_tags"
                    ],
                    "EXTRA_PROPERTIES": {
                      "EXTRA_PROPERTIES": "EXTRA_PROPERTIES"
                    }
                  }
                ]
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            Resource.resourceZero(
                ResourceZero(
                    resourceType: .user,
                    userName: "userName",
                    metadataTags: [
                        "metadata_tags",
                        "metadata_tags"
                    ],
                    extraProperties: [
                        "EXTRA_PROPERTIES": "EXTRA_PROPERTIES"
                    ]
                )
            ),
            Resource.resourceZero(
                ResourceZero(
                    resourceType: .user,
                    userName: "userName",
                    metadataTags: [
                        "metadata_tags",
                        "metadata_tags"
                    ],
                    extraProperties: [
                        "EXTRA_PROPERTIES": "EXTRA_PROPERTIES"
                    ]
                )
            )
        ]
        let response = try await client.service.listresources(
            pageLimit: 1,
            beforeDate: CalendarDate("2023-01-15")!,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}
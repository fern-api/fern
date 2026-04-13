import Foundation
import Testing
import Api

@Suite("OrganizationsClient Wire Tests") struct OrganizationsClientWireTests {
    @Test func getorganization1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "name": "name",
                  "tags": [
                    "tags"
                  ]
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Organization(
            name: "name",
            tags: [
                "tags"
            ]
        )
        let response = try await client.organizations.getorganization(
            tenantId: "tenant_id",
            organizationId: "organization_id",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getorganization2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "name": "name",
                  "tags": [
                    "tags",
                    "tags"
                  ]
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Organization(
            name: "name",
            tags: [
                "tags",
                "tags"
            ]
        )
        let response = try await client.organizations.getorganization(
            tenantId: "tenant_id",
            organizationId: "organization_id",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getorganizationuser1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "name": "name",
                  "tags": [
                    "tags"
                  ]
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = User(
            name: "name",
            tags: [
                "tags"
            ]
        )
        let response = try await client.organizations.getorganizationuser(
            tenantId: "tenant_id",
            organizationId: "organization_id",
            userId: "user_id",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getorganizationuser2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "name": "name",
                  "tags": [
                    "tags",
                    "tags"
                  ]
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = User(
            name: "name",
            tags: [
                "tags",
                "tags"
            ]
        )
        let response = try await client.organizations.getorganizationuser(
            tenantId: "tenant_id",
            organizationId: "organization_id",
            userId: "user_id",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func searchorganizations1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "name": "name",
                    "tags": [
                      "tags"
                    ]
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
            Organization(
                name: "name",
                tags: [
                    "tags"
                ]
            )
        ]
        let response = try await client.organizations.searchorganizations(
            tenantId: "tenant_id",
            organizationId: "organization_id",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func searchorganizations2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "name": "name",
                    "tags": [
                      "tags",
                      "tags"
                    ]
                  },
                  {
                    "name": "name",
                    "tags": [
                      "tags",
                      "tags"
                    ]
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
            Organization(
                name: "name",
                tags: [
                    "tags",
                    "tags"
                ]
            ),
            Organization(
                name: "name",
                tags: [
                    "tags",
                    "tags"
                ]
            )
        ]
        let response = try await client.organizations.searchorganizations(
            tenantId: "tenant_id",
            organizationId: "organization_id",
            limit: .value(1),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}
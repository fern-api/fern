import Foundation
import Testing
import Api

@Suite("Client Wire Tests") struct ClientWireTests {
    @Test func getFoo1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "bar": "bar",
                  "nullable_bar": "nullable_bar",
                  "nullable_required_bar": "nullable_required_bar",
                  "required_bar": "required_bar"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Foo(
            bar: Optional(Nullable<String>.value("bar")),
            nullableBar: Optional(Nullable<String>.value("nullable_bar")),
            nullableRequiredBar: Nullable<String>.value("nullable_required_bar"),
            requiredBar: "required_bar"
        )
        let response = try await client..getFoo(
            requiredBaz: "required_baz",
            requiredNullableBaz: .value("required_nullable_baz"),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getFoo2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "bar": "bar",
                  "nullable_bar": "nullable_bar",
                  "nullable_required_bar": "nullable_required_bar",
                  "required_bar": "required_bar"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Foo(
            bar: Optional(Nullable<String>.value("bar")),
            nullableBar: Optional(Nullable<String>.value("nullable_bar")),
            nullableRequiredBar: Nullable<String>.value("nullable_required_bar"),
            requiredBar: "required_bar"
        )
        let response = try await client..getFoo(
            optionalBaz: .value("optional_baz"),
            optionalNullableBaz: .value("optional_nullable_baz"),
            requiredBaz: "required_baz",
            requiredNullableBaz: .value("required_nullable_baz"),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func updateFoo1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "bar": "bar",
                  "nullable_bar": "nullable_bar",
                  "nullable_required_bar": "nullable_required_bar",
                  "required_bar": "required_bar"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Foo(
            bar: Optional(Nullable<String>.value("bar")),
            nullableBar: Optional(Nullable<String>.value("nullable_bar")),
            nullableRequiredBar: Nullable<String>.value("nullable_required_bar"),
            requiredBar: "required_bar"
        )
        let response = try await client..updateFoo(
            id: "id",
            request: .init(),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func updateFoo2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "bar": "bar",
                  "nullable_bar": "nullable_bar",
                  "nullable_required_bar": "nullable_required_bar",
                  "required_bar": "required_bar"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Foo(
            bar: Optional(Nullable<String>.value("bar")),
            nullableBar: Optional(Nullable<String>.value("nullable_bar")),
            nullableRequiredBar: Nullable<String>.value("nullable_required_bar"),
            requiredBar: "required_bar"
        )
        let response = try await client..updateFoo(
            id: "id",
            request: .init(
                nullableText: .value("nullable_text"),
                nullableNumber: .value(1.1),
                nonNullableText: .value("non_nullable_text")
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}
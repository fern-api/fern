import Foundation
import Testing
import Api

@Suite("VendorClient Wire Tests") struct VendorClientWireTests {
    @Test func updateVendor1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "name": "name",
                  "status": "ACTIVE",
                  "update_request": {
                    "name": "name",
                    "status": "ACTIVE"
                  }
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Vendor(
            id: "id",
            name: "name",
            status: Optional(.active),
            updateRequest: Optional(UpdateVendorRequest(
                name: "name",
                status: Optional(.active)
            ))
        )
        let response = try await client.vendor.updateVendor(
            vendorId: "vendor_id",
            request: UpdateVendorRequest(
                name: "name"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func updateVendor2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "name": "name",
                  "status": "ACTIVE",
                  "update_request": {
                    "name": "name",
                    "status": "ACTIVE"
                  }
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Vendor(
            id: "id",
            name: "name",
            status: Optional(.active),
            updateRequest: Optional(UpdateVendorRequest(
                name: "name",
                status: Optional(.active)
            ))
        )
        let response = try await client.vendor.updateVendor(
            vendorId: "vendor_id",
            request: UpdateVendorRequest(
                name: "name",
                status: .active
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func createVendor1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "name": "name",
                  "status": "ACTIVE",
                  "update_request": {
                    "name": "name",
                    "status": "ACTIVE"
                  }
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Vendor(
            id: "id",
            name: "name",
            status: Optional(.active),
            updateRequest: Optional(UpdateVendorRequest(
                name: "name",
                status: Optional(.active)
            ))
        )
        let response = try await client.vendor.createVendor(
            request: .init(name: "name"),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func createVendor2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "name": "name",
                  "status": "ACTIVE",
                  "update_request": {
                    "name": "name",
                    "status": "ACTIVE"
                  }
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Vendor(
            id: "id",
            name: "name",
            status: Optional(.active),
            updateRequest: Optional(UpdateVendorRequest(
                name: "name",
                status: Optional(.active)
            ))
        )
        let response = try await client.vendor.createVendor(
            request: .init(
                name: "name",
                address: "address"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}
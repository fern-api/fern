import Foundation
import Testing
import Api

@Suite("VendorClient Wire Tests") struct VendorClientWireTests {
    @Test func updateVendor1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "id": "id",
                  "name": "name",
                  "status": "ACTIVE",
                  "update_request": {
                    "name": "name",
                    "status": "ACTIVE"
                  }
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Vendor(
            id: "id",
            name: "name",
            status: Optional(VendorStatus.active),
            updateRequest: Optional(UpdateVendorRequest(
                name: "name",
                status: Optional(UpdateVendorRequestStatus.active)
            ))
        )
        let response = try await client.vendor.updateVendor(
            vendorId: "vendor_id",
            request: UpdateVendorRequest(
                name: "name"
            ),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func createVendor1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "id": "id",
                  "name": "name",
                  "status": "ACTIVE",
                  "update_request": {
                    "name": "name",
                    "status": "ACTIVE"
                  }
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Vendor(
            id: "id",
            name: "name",
            status: Optional(VendorStatus.active),
            updateRequest: Optional(UpdateVendorRequest(
                name: "name",
                status: Optional(UpdateVendorRequestStatus.active)
            ))
        )
        let response = try await client.vendor.createVendor(
            request: .init(name: "name"),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}
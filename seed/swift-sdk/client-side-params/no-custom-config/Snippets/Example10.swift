import ClientSideParams

let client = SeedClientSideParamsClient(token: "<token>")

try await client.service.listClients(
    request: .init(
        fields: "fields",
        includeFields: True,
        page: 1,
        perPage: 1,
        includeTotals: True,
        isGlobal: True,
        isFirstParty: True,
        appType: [
            "app_type",
            "app_type"
        ]
    )
)

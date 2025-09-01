import MyCustomModule

let client = MyCustomClient(token: "<token>")

try await client.service.listResources(
    request: .init(
        page: 1,
        perPage: 1,
        sort: "created_at",
        order: "desc",
        includeTotals: True,
        fields: "fields",
        search: "search"
    )
)

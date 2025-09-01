import OauthClientCredentialsDefault

let client = SeedOauthClientCredentialsDefaultClient()

try await client.nestedNoAuth.api.getSomething(

)

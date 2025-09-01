import OauthClientCredentials

let client = SeedOauthClientCredentialsClient()

try await client.nestedNoAuth.api.getSomething(

)

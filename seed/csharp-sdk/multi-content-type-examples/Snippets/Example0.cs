using SeedApi;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Clients.CreateAsync(
            new ClientRequest {
                Client = new Client {
                    Name = "Acme Corp",
                    Email = "contact@acme.com"
                }
            }
        );
    }

}

using SeedApi;

namespace Usage;

public class Example21
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.ListclientsAsync(
            new ServiceListClientsRequest {
                Fields = "fields",
                IncludeFields = true,
                Page = 1,
                PerPage = 1,
                IncludeTotals = true,
                IsGlobal = true,
                IsFirstParty = true,
                AppType = new List<string>(){
                    "app_type",
                    "app_type",
                }

            }
        );
    }

}

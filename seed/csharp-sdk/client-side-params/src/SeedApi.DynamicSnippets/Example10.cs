using SeedClientSideParams;

namespace Usage;

public class Example10
{
    public async Task Do() {
        var client = new SeedClientSideParamsClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.ListClientsAsync(
            new ListClientsRequest {
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

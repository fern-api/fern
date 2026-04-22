using SeedApi;
using OneOf;

public partial class Examples
{
    public async Task Example3() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.DataService.CreateAsync(
            new CreateRequest {
                Name = "name",
                Description = "description",
                ToolChoice = new ToolChoice {
                    Mode = ToolMode.ToolModeInvalid,
                    FunctionName = "function_name"
                },
                Url = "url",
                Content = "content",
                Metadata = new Dictionary<string, OneOf<double, string, bool>>(){
                    ["metadata"] = 1.1,
                }

            }
        );
    }

}

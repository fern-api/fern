using SeedApi;

namespace Usage;

public class Example7
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Queryparam.SendAsync(
            new QueryParamSendRequest {
                Operand = Operand.GreaterThan,
                OperandOrColor = Color.Red
            }
        );
    }

}

using SeedApi;

namespace Usage;

public class Example5
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Pathparam.SendAsync(
            new PathParamSendRequest {
                Operand = Operand.GreaterThan,
                OperandOrColor = Color.Red
            }
        );
    }

}

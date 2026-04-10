using SeedApi;

namespace Usage;

public class Example3
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Inlinedrequest.SendAsync(
            new InlinedRequestSendRequest {
                Operand = Operand.GreaterThan,
                MaybeOperand = Operand.GreaterThan,
                OperandOrColor = Color.Red,
                MaybeOperandOrColor = Color.Red
            }
        );
    }

}

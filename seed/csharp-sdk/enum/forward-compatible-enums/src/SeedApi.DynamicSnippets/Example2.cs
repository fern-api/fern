using SeedEnum;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedEnumClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.InlinedRequest.SendAsync(
            new SendEnumInlinedRequest {
                Operand = Operand.GreaterThan,
                MaybeOperand = Operand.GreaterThan,
                OperandOrColor = Color.Red,
                MaybeOperandOrColor = Color.Red
            }
        );
    }

}

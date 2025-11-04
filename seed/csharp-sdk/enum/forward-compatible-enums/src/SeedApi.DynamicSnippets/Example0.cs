using SeedEnum;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedEnumClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Headers.SendAsync(
            new SendEnumAsHeaderRequest {
                Operand = Operand.GreaterThan,
                MaybeOperand = Operand.GreaterThan,
                OperandOrColor = Color.Red
            }
        );
    }

}

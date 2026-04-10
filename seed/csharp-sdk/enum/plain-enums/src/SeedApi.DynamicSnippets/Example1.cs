using SeedEnum;

namespace Usage;

public class Example1
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
                OperandOrColor = Color.Red
            }
        );
    }

}

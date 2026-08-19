using SeedEnum;

public partial class Examples
{
    public async Task Example1() {
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

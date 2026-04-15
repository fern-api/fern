using SeedEnum;

public partial class Examples
{
    public async Task Example2() {
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

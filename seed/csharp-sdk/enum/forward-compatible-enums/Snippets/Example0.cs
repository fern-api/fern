using SeedEnum;

public partial class Examples
{
    public async Task Example0() {
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

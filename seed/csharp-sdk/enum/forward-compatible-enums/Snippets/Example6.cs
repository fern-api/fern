using SeedEnum;

public partial class Examples
{
    public async Task Example6() {
        var client = new SeedEnumClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.QueryParam.SendAsync(
            new SendEnumAsQueryParamRequest {
                Operand = Operand.GreaterThan,
                MaybeOperand = Operand.GreaterThan,
                OperandOrColor = Color.Red,
                MaybeOperandOrColor = Color.Red
            }
        );
    }

}

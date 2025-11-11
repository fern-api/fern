using SeedEnum;

namespace Usage;

public class Example5
{
    public async Task Do() {
        var client = new SeedEnumClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.QueryParam.SendAsync(
            new SendEnumAsQueryParamRequest {
                Operand = Operand.GreaterThan,
                OperandOrColor = Color.Red
            }
        );
    }

}

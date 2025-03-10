using global::System.Threading.Tasks;
using SeedEnum;
using SeedEnum.Core;

namespace Usage;

public class Example5
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedEnumClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.QueryParam.SendAsync(
            new SendEnumAsQueryParamRequest{
                Operand = Operand.GreaterThan,
                MaybeOperand = Operand.GreaterThan,
                OperandOrColor = Color.Red,
                MaybeOperandOrColor = Color.Red
            }
        );
    }

}

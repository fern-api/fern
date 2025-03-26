using global::System.Threading.Tasks;
using SeedEnum;
using OneOf;

namespace Usage;

public class Example6
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedEnumClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.QueryParam.SendListAsync(
            new SendEnumListAsQueryParamRequest{
                Operand = new List<Operand>(){
                    Operand.GreaterThan,
                },
                MaybeOperand = new List<Operand>(){
                    Operand.GreaterThan,
                },
                OperandOrColor = new List<OneOf<Color, Operand>>(){
                    Color.Red,
                },
                MaybeOperandOrColor = new List<OneOf<Color, Operand>>(){
                    Color.Red,
                }
            }
        );
    }

}

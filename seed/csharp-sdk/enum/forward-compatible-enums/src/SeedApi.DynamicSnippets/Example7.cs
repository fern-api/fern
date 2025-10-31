using SeedEnum;
using OneOf;

namespace Usage;

public class Example7
{
    public async Task Do() {
        var client = new SeedEnumClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.QueryParam.SendListAsync(
            new SendEnumListAsQueryParamRequest {
                Operand = new List<Operand>(){
                    Operand.GreaterThan,
                }
                ,
                MaybeOperand = new List<Operand>(){
                    Operand.GreaterThan,
                }
                ,
                OperandOrColor = new List<OneOf<Color, Operand>>(){
                    Color.Red,
                }
                ,
                MaybeOperandOrColor = new List<OneOf<Color, Operand>>(){
                    Color.Red,
                }

            }
        );
    }

}

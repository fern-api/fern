using SeedApi;
using OneOf;

namespace Usage;

public class Example9
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Queryparam.SendlistAsync(
            new QueryParamSendListRequest {
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

using SeedEnum;
using OneOf;

public partial class Examples
{
    public async Task Example7() {
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

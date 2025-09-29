using SeedEnum;
using System.Threading.Tasks;

namespace Usage;

public class Example4
{
    public async Task Do() {
        var client = new SeedEnumClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.PathParam.SendAsync(
            Operand.GreaterThan,
            Color.Red
        );
    }

}

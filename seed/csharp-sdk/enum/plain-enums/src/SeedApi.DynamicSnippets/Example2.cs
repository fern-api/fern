using global::System.Threading.Tasks;
using SeedEnum;
using SeedEnum.Core;

namespace Usage;

public class Example2
{
    public async global::System.Threading.Tasks.Task Do() {
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

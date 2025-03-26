using global::System.Threading.Tasks;
using SeedValidation;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedValidationClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.CreateAsync(
            new CreateRequest{
                Decimal = 2.2,
                Even = 100,
                Name = "foo",
                Shape = Shape.Square
            }
        );
    }

}

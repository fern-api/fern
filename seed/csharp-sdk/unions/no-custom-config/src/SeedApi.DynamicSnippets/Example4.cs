using global::System.Threading.Tasks;
using SeedUnions;

namespace Usage;

public class Example4
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedUnionsClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Union.UpdateAsync(
            new Shape(
                new Circle{
                    Radius = 1.1
                }
            ) {
                Id = "id",
            }
        );
    }

}

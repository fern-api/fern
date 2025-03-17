using global::System.Threading.Tasks;
using SeedExamples;

namespace Usage;

public class Example13
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExamplesClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetMovieAsync(
            "movieId"
        );
    }

}

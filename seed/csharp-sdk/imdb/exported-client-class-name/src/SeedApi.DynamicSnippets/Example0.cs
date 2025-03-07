using global::System.Threading.Tasks;
using SeedApi;
using SeedApi.Core;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new CustomClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Imdb.CreateMovieAsync(
            new CreateMovieRequest{
                Title = "title",
                Rating = 1.1
            }
        );
    }

}

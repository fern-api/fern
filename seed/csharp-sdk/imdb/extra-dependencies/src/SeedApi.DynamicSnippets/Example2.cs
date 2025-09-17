using SeedApi;
using System.Threading.Tasks;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Imdb.GetMovieAsync(
            "movieId"
        );
    }

}

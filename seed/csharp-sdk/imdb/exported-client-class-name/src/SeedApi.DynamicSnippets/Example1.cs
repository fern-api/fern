using System.Threading.Tasks;
using SeedApi;

namespace Usage;

public class Example1
{
    public async Task Do()
    {
        var client = new SeedApi.CustomClient(
            token: "<token>",
            clientOptions: new ClientOptions
            {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Imdb.GetMovieAsync(
            "movieId"
        );
    }

}

using SeedApi;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new BaseClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Imdb.GetMovieAsync(
            "movieId"
        );
    }

}

using SeedApi;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Imdb.CreateMovieAsync(
            new CreateMovieRequest {
                Title = "title",
                Rating = 1.1
            }
        );
    }

}

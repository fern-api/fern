using SeedApi;

namespace Usage;

public class Example3
{
    public async Task Do() {
        var client = new CustomClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Imdb.GetmovieAsync(
            new ImdbGetMovieRequest {
                MovieId = "movieId"
            }
        );
    }

}

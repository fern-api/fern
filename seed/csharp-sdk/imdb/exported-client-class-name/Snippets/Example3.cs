using SeedApi;

public partial class Examples
{
    public async Task Example3() {
        var client = new CustomClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Imdb.GetMovieAsync(
            new GetMovieImdbRequest {
                MovieId = "movieId"
            }
        );
    }

}

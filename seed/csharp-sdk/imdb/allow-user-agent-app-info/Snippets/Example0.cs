using SeedApi;

public partial class Examples
{
    public async Task Example0() {
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

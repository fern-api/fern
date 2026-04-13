using SeedApi;

public partial class Examples
{
    public async Task Example10() {
        var client = new SeedExamplesClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetmovieAsync(
            new ServiceGetMovieRequest {
                MovieId = "movieId"
            }
        );
    }

}

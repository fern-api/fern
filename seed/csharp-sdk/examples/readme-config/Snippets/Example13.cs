using SeedExamples;

public partial class Examples
{
    public async Task Example13() {
        var client = new SeedExamplesClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetMovieAsync(
            "movie-c06a4ad7"
        );
    }

}

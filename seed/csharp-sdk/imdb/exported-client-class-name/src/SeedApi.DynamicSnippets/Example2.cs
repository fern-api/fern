using SeedApi;

public partial class Examples
{
    public static async Task Example2()
    {
        var client = new CustomClient(
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

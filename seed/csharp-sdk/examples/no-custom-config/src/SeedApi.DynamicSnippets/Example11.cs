using SeedApi;

namespace Usage;

public class Example11
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.CreatemovieAsync(
            new Movie {
                Id = "id",
                Title = "title",
                From = "from",
                Rating = 1.1,
                Type = MovieType.Movie,
                Tag = "tag",
                Metadata = new Dictionary<string, object?>(){
                    ["key"] = "value",
                }
                ,
                Revenue = 1000000L
            }
        );
    }

}

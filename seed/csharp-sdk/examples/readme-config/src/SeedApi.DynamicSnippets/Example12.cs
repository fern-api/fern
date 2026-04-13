using SeedApi;

namespace Usage;

public class Example12
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
                Prequel = "prequel",
                Title = "title",
                From = "from",
                Rating = 1.1,
                Type = MovieType.Movie,
                Tag = "tag",
                Book = "book",
                Metadata = new Dictionary<string, object?>(){
                    ["metadata"] = new Dictionary<string, object>()
                    {
                        ["key"] = "value",
                    }
                    ,
                }
                ,
                Revenue = 1000000L
            }
        );
    }

}

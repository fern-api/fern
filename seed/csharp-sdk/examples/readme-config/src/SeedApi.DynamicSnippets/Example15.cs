using global::System.Threading.Tasks;
using SeedExamples;

namespace Usage;

public class Example15
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExamplesClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.CreateMovieAsync(
            new Movie{
                Id = "id",
                Prequel = "prequel",
                Title = "title",
                From = "from",
                Rating = 1.1,
                Type = "movie",
                Tag = "tag",
                Book = "book",
                Metadata = new Dictionary<string, object>(){
                    ["metadata"] = new Dictionary<string, object>() {
                        ["key"] = "value",
                    },
                },
                Revenue = 1000000l
            }
        );
    }

}

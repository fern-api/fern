using SeedExamples;

namespace Usage;

public class Example15
{
    public async Task Do() {
        var client = new SeedExamplesClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.CreateMovieAsync(
            new Movie {
                Id = "movie-c06a4ad7",
                Prequel = "movie-cv9b914f",
                Title = "The Boy and the Heron",
                From = "Hayao Miyazaki",
                Rating = 8,
                Type = "movie",
                Tag = "tag-wf9as23d",
                Metadata = new Dictionary<string, object?>(){
                    ["actors"] = new List<object>()
                    {
                        "Christian Bale",
                        "Florence Pugh",
                        "Willem Dafoe",
                    }
                    ,
                    ["releaseDate"] = "2023-12-08",
                    ["ratings"] = new Dictionary<string, object>()
                    {
                        ["rottenTomatoes"] = 97,
                        ["imdb"] = 7.6,
                    }
                    ,
                }
                ,
                Revenue = 1000000L
            }
        );
    }

}

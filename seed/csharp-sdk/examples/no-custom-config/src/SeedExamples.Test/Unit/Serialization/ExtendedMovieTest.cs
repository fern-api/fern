using NUnit.Framework;
using SeedExamples;
using SeedExamples.Test_.Utils;

namespace SeedExamples.Test_;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class ExtendedMovieTest
{
    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "id": "movie-sda231x",
              "title": "Pulp Fiction",
              "from": "Quentin Tarantino",
              "rating": 8.5,
              "type": "movie",
              "tag": "tag-12efs9dv",
              "cast": [
                "John Travolta",
                "Samuel L. Jackson",
                "Uma Thurman",
                "Bruce Willis"
              ],
              "metadata": {
                "academyAward": true,
                "releaseDate": "2023-12-08",
                "ratings": {
                  "rottenTomatoes": 97,
                  "imdb": 7.6
                }
              },
              "revenue": 1000000
            }
            """;
        JsonAssert.Roundtrips<ExtendedMovie>(inputJson);
    }
}

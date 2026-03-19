using NUnit.Framework;
using SeedExamples;
using SeedExamples.Test_.Utils;

namespace SeedExamples.Test_;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class MovieTest
{
    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var inputJson = """
            {
              "id": "movie-c06a4ad7",
              "prequel": "movie-cv9b914f",
              "title": "The Boy and the Heron",
              "from": "Hayao Miyazaki",
              "rating": 8,
              "type": "movie",
              "tag": "tag-wf9as23d",
              "metadata": {
                "actors": [
                  "Christian Bale",
                  "Florence Pugh",
                  "Willem Dafoe"
                ],
                "releaseDate": "2023-12-08",
                "ratings": {
                  "rottenTomatoes": 97,
                  "imdb": 7.6
                }
              },
              "revenue": 1000000
            }
            """;
        JsonAssert.Roundtrips<Movie>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "id": "movie-large-123",
              "title": "Big Budget Film",
              "from": "Famous Director",
              "rating": 4294967295,
              "type": "movie",
              "tag": "tag-wf9as23d",
              "metadata": {
                "budget": "Very high"
              },
              "revenue": 5000000000
            }
            """;
        JsonAssert.Roundtrips<Movie>(inputJson);
    }
}

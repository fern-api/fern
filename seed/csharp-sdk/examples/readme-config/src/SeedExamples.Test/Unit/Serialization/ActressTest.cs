using NUnit.Framework;
using SeedExamples;
using SeedExamples.Test_.Utils;

namespace SeedExamples.Test_;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class ActressTest
{
    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "name": "Jennifer Lawrence",
              "id": "actor_456"
            }
            """;
        JsonAssert.Roundtrips<Actress>(inputJson);
    }
}

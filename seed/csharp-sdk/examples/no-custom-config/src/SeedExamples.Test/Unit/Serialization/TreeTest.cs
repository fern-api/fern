using NUnit.Framework;
using SeedExamples;
using SeedExamples.Test_.Utils;

namespace SeedExamples.Test_;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class TreeTest
{
    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "nodes": [
                {
                  "name": "left"
                },
                {
                  "name": "right"
                }
              ]
            }
            """;
        JsonAssert.Roundtrips<Tree>(inputJson);
    }
}

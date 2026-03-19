using NUnit.Framework;
using SeedExamples.Commons;
using SeedExamples.Test_.Utils;

namespace SeedExamples.Test_;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class DataTest
{
    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "type": "string",
              "value": "data"
            }
            """;
        JsonAssert.Roundtrips<Data>(inputJson);
    }
}

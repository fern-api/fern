using NUnit.Framework;
using SeedExamples.Commons;
using SeedExamples.Test_.Utils;

namespace SeedExamples.Test_;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class EventInfoTest
{
    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "type": "metadata",
              "id": "metadata-alskjfg8",
              "data": {
                "one": "two"
              },
              "jsonString": "{\"one\": \"two\"}"
            }
            """;
        JsonAssert.Roundtrips<EventInfo>(inputJson);
    }
}

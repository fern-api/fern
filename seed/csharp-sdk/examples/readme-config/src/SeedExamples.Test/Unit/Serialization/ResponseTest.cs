using NUnit.Framework;
using SeedExamples;
using SeedExamples.Test_.Utils;

namespace SeedExamples.Test_;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class ResponseTest
{
    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "response": "Initializing...",
              "identifiers": [
                {
                  "type": "primitive",
                  "value": "example",
                  "label": "Primitive"
                },
                {
                  "type": "unknown",
                  "value": "{}",
                  "label": "Unknown"
                }
              ]
            }
            """;
        JsonAssert.Roundtrips<Response>(inputJson);
    }
}

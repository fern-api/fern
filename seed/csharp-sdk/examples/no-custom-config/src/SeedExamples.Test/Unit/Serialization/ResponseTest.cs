using NUnit.Framework;
using SeedExamples;
using SeedExamples.Core;
using SeedExamples.Test_.Utils;

namespace SeedExamples.Test_;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class ResponseTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
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
        var expectedObject = new Response
        {
            Response_ = "Initializing...",
            Identifiers = new List<Identifier>()
            {
                new Identifier
                {
                    Type = BasicType.Primitive,
                    Value = "example",
                    Label = "Primitive",
                },
                new Identifier
                {
                    Type = ComplexType.Unknown,
                    Value = "{}",
                    Label = "Unknown",
                },
            },
        };
        var deserializedObject = JsonUtils.Deserialize<Response>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

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

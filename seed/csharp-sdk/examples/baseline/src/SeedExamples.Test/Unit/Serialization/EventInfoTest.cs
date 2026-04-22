using NUnit.Framework;
using SeedExamples.Commons;
using SeedExamples.Core;
using SeedExamples.Test_.Utils;

namespace SeedExamples.Test_;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class EventInfoTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "type": "metadata",
              "id": "metadata-alskjfg8",
              "data": {
                "one": "two"
              },
              "jsonString": "{\"one\": \"two\"}"
            }
            """;
        var expectedObject = new EventInfo(
            new Commons.EventInfo.Metadata(
                new Commons.Metadata
                {
                    Id = "metadata-alskjfg8",
                    Data = new Dictionary<string, string>() { { "one", "two" } },
                    JsonString = "{\"one\": \"two\"}",
                }
            )
        );
        var deserializedObject = JsonUtils.Deserialize<EventInfo>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

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

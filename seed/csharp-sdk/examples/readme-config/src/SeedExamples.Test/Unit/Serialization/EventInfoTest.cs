using System.Text.Json;
using NUnit.Framework;
using SeedExamples.Commons;
using SeedExamples.Core;

namespace SeedExamples.Test;

[TestFixture]
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
            new EventInfo.Metadata(
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
        var expectedJson = """
            {
              "type": "metadata",
              "id": "metadata-alskjfg8",
              "data": {
                "one": "two"
              },
              "jsonString": "{\"one\": \"two\"}"
            }
            """;
        var actualObj = new EventInfo(
            new EventInfo.Metadata(
                new Commons.Metadata
                {
                    Id = "metadata-alskjfg8",
                    Data = new Dictionary<string, string>() { { "one", "two" } },
                    JsonString = "{\"one\": \"two\"}",
                }
            )
        );
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}

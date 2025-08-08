using System.Text.Json;
using NUnit.Framework;

namespace SeedExamples.Test;

[TestFixture]
public class EventInfoTest
{
    [Test]
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
        var expectedObject = new SeedExamples.Commons.EventInfo(
            new SeedExamples.Commons.EventInfo.Metadata(
                new SeedExamples.Commons.Metadata
                {
                    Id = "metadata-alskjfg8",
                    Data = new Dictionary<string, string>() { { "one", "two" } },
                    JsonString = "{\"one\": \"two\"}",
                }
            )
        );
        var deserializedObject =
            SeedExamples.Core.JsonUtils.Deserialize<SeedExamples.Commons.EventInfo>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
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
        var actualObj = new SeedExamples.Commons.EventInfo(
            new SeedExamples.Commons.EventInfo.Metadata(
                new SeedExamples.Commons.Metadata
                {
                    Id = "metadata-alskjfg8",
                    Data = new Dictionary<string, string>() { { "one", "two" } },
                    JsonString = "{\"one\": \"two\"}",
                }
            )
        );
        var actualElement = SeedExamples.Core.JsonUtils.SerializeToElement(actualObj);
        var expectedElement = SeedExamples.Core.JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}

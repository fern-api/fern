using System.Text.Json;
using NUnit.Framework;

namespace SeedExamples.Test;

[TestFixture]
public class DataTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "type": "string",
              "value": "data"
            }
            """;
        var expectedObject = new SeedExamples.Commons.Data(
            new SeedExamples.Commons.Data.String("data")
        );
        var deserializedObject = SeedExamples.Core.JsonUtils.Deserialize<SeedExamples.Commons.Data>(
            json
        );
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization()
    {
        var expectedJson = """
            {
              "type": "string",
              "value": "data"
            }
            """;
        var actualObj = new SeedExamples.Commons.Data(new SeedExamples.Commons.Data.String("data"));
        var actualElement = SeedExamples.Core.JsonUtils.SerializeToElement(actualObj);
        var expectedElement = SeedExamples.Core.JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}

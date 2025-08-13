using System.Text.Json;
using NUnit.Framework;
using SeedExamples.Commons;
using SeedExamples.Core;

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
        var expectedObject = new Data(new Data.String("data"));
        var deserializedObject = JsonUtils.Deserialize<Data>(json);
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
        var actualObj = new Data(new Data.String("data"));
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}

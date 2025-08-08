using System.Text.Json;
using NUnit.Framework;

namespace SeedExamples.Test;

[TestFixture]
public class RequestTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "request": {}
            }
            """;
        var expectedObject = new SeedExamples.Request
        {
            Request_ = new Dictionary<object, object?>() { },
        };
        var deserializedObject = SeedExamples.Core.JsonUtils.Deserialize<SeedExamples.Request>(
            json
        );
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization()
    {
        var expectedJson = """
            {
              "request": {}
            }
            """;
        var actualObj = new SeedExamples.Request
        {
            Request_ = new Dictionary<object, object?>() { },
        };
        var actualElement = SeedExamples.Core.JsonUtils.SerializeToElement(actualObj);
        var expectedElement = SeedExamples.Core.JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}

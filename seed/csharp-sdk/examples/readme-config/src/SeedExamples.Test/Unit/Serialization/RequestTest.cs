using System.Text.Json;
using NUnit.Framework;
using SeedExamples.Core;

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
        var expectedObject = new Request { Request_ = new Dictionary<object, object?>() { } };
        var deserializedObject = JsonUtils.Deserialize<Request>(json);
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
        var actualObj = new Request { Request_ = new Dictionary<object, object?>() { } };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}

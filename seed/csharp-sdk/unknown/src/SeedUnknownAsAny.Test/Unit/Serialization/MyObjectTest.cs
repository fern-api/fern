using System.Text.Json;
using NUnit.Framework;
using SeedUnknownAsAny.Core;

namespace SeedUnknownAsAny.Test;

[TestFixture]
public class MyObjectTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "unknown": {
                "boolVal": true,
                "strVal": "string"
              }
            }
            """;
        var expectedObject = new MyObject
        {
            Unknown = new Dictionary<object, object?>()
            {
                { "boolVal", true },
                { "strVal", "string" },
            },
        };
        var deserializedObject = JsonUtils.Deserialize<MyObject>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization()
    {
        var expectedJson = """
            {
              "unknown": {
                "boolVal": true,
                "strVal": "string"
              }
            }
            """;
        var actualObj = new MyObject
        {
            Unknown = new Dictionary<object, object?>()
            {
                { "boolVal", true },
                { "strVal", "string" },
            },
        };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}

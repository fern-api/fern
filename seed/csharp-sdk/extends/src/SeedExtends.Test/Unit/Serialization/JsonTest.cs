using System.Text.Json;
using NUnit.Framework;
using SeedExtends;
using SeedExtends.Core;

namespace SeedExtends.Test;

[TestFixture]
public class JsonTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "docs": "Types extend this type to include a docs and json property.",
              "raw": "{\"docs\": true, \"json\": true}"
            }
            """;
        var expectedObject = new Json
        {
            Docs = "Types extend this type to include a docs and json property.",
            Raw = "{\"docs\": true, \"json\": true}",
        };
        var deserializedObject = JsonUtils.Deserialize<Json>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization()
    {
        var expectedJson = """
            {
              "docs": "Types extend this type to include a docs and json property.",
              "raw": "{\"docs\": true, \"json\": true}"
            }
            """;
        var actualObj = new Json
        {
            Docs = "Types extend this type to include a docs and json property.",
            Raw = "{\"docs\": true, \"json\": true}",
        };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}

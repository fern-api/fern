using System.Text.Json;
using NUnit.Framework;
using SeedExtends.Core;

namespace SeedExtends.Test;

[TestFixture]
public class DocsTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "docs": "Types extend this type to include a docs property."
            }
            """;
        var expectedObject = new Docs
        {
            Docs_ = "Types extend this type to include a docs property.",
        };
        var deserializedObject = JsonUtils.Deserialize<Docs>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization()
    {
        var expectedJson = """
            {
              "docs": "Types extend this type to include a docs property."
            }
            """;
        var actualObj = new Docs { Docs_ = "Types extend this type to include a docs property." };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}

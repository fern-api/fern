using System.Text.Json;
using NUnit.Framework;
using SeedAlias.Core;

namespace SeedAlias.Test;

[TestFixture]
public class TypeTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "id": "type-df89sdg1",
              "name": "foo"
            }
            """;
        var expectedObject = new Type { Id = "type-df89sdg1", Name = "foo" };
        var deserializedObject = JsonUtils.Deserialize<Type>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization()
    {
        var expectedJson = """
            {
              "id": "type-df89sdg1",
              "name": "foo"
            }
            """;
        var actualObj = new Type { Id = "type-df89sdg1", Name = "foo" };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}

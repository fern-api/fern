using System.Text.Json.Nodes;
using NUnit.Framework;
using SeedAlias;
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
        var serializedJson = JsonUtils.Serialize(deserializedObject);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingPropertiesComparer());
    }

    [Test]
    public void TestSerialization()
    {
        var json = """
            {
              "id": "type-df89sdg1",
              "name": "foo"
            }
            """;
        var obj = new Type { Id = "type-df89sdg1", Name = "foo" };
        var objAsNode = JsonUtils.SerializeToNode(obj);
        var jsonAsNode = JsonUtils.Deserialize<JsonNode>(json);
        Assert.That(objAsNode, Is.EqualTo(jsonAsNode).UsingPropertiesComparer());
    }
}

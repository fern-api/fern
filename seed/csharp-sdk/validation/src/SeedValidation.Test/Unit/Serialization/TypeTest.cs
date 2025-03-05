using System.Text.Json.Nodes;
using NUnit.Framework;
using SeedValidation;
using SeedValidation.Core;

namespace SeedValidation.Test;

[TestFixture]
public class TypeTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "decimal": 1.1,
              "even": 2,
              "name": "rules",
              "shape": "SQUARE"
            }
            """;
        var expectedObject = new Type
        {
            Decimal = 1.1,
            Even = 2,
            Name = "rules",
            Shape = Shape.Square,
        };
        var deserializedObject = JsonUtils.Deserialize<Type>(json);
        var serializedJson = JsonUtils.Serialize(deserializedObject);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingPropertiesComparer());
    }

    [Test]
    public void TestSerialization()
    {
        var json = """
            {
              "decimal": 1.1,
              "even": 2,
              "name": "rules",
              "shape": "SQUARE"
            }
            """;
        var obj = new Type
        {
            Decimal = 1.1,
            Even = 2,
            Name = "rules",
            Shape = Shape.Square,
        };
        var objAsNode = JsonUtils.SerializeToNode(obj);
        var jsonAsNode = JsonUtils.Deserialize<JsonNode>(json);
        Assert.That(objAsNode, Is.EqualTo(jsonAsNode).UsingPropertiesComparer());
    }
}

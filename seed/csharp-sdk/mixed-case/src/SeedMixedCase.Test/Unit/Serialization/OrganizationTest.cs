using System.Text.Json.Nodes;
using NUnit.Framework;
using SeedMixedCase;
using SeedMixedCase.Core;

namespace SeedMixedCase.Test;

[TestFixture]
public class OrganizationTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "name": "orgName"
            }
            """;
        var expectedObject = new Organization { Name = "orgName" };
        var deserializedObject = JsonUtils.Deserialize<Organization>(json);
        var serializedJson = JsonUtils.Serialize(deserializedObject);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingPropertiesComparer());
    }

    [Test]
    public void TestSerialization()
    {
        var json = """
            {
              "name": "orgName"
            }
            """;
        var obj = new Organization { Name = "orgName" };
        var objAsNode = JsonUtils.SerializeToNode(obj);
        var jsonAsNode = JsonUtils.Deserialize<JsonNode>(json);
        Assert.That(objAsNode, Is.EqualTo(jsonAsNode).UsingPropertiesComparer());
    }
}

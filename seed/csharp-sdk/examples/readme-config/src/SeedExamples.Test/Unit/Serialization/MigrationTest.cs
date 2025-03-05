using System.Text.Json.Nodes;
using NUnit.Framework;
using SeedExamples;
using SeedExamples.Core;

namespace SeedExamples.Test;

[TestFixture]
public class MigrationTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "name": "001_init",
              "status": "RUNNING"
            }
            """;
        var expectedObject = new Migration { Name = "001_init", Status = MigrationStatus.Running };
        var deserializedObject = JsonUtils.Deserialize<Migration>(json);
        var serializedJson = JsonUtils.Serialize(deserializedObject);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingPropertiesComparer());
    }

    [Test]
    public void TestSerialization()
    {
        var json = """
            {
              "name": "001_init",
              "status": "RUNNING"
            }
            """;
        var obj = new Migration { Name = "001_init", Status = MigrationStatus.Running };
        var objAsNode = JsonUtils.SerializeToNode(obj);
        var jsonAsNode = JsonUtils.Deserialize<JsonNode>(json);
        Assert.That(objAsNode, Is.EqualTo(jsonAsNode).UsingPropertiesComparer());
    }
}

using System.Text.Json.Nodes;
using NUnit.Framework;
using SeedExamples.Core;

namespace SeedExamples.Test;

[TestFixture]
public class FileTest
{
    [Test]
    public void TestDeserialization_1()
    {
        var json = """
            {
              "name": "file.txt",
              "contents": "..."
            }
            """;
        var expectedObject = new File { Name = "file.txt", Contents = "..." };
        var deserializedObject = JsonUtils.Deserialize<File>(json);
        var serializedJson = JsonUtils.Serialize(deserializedObject);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingPropertiesComparer());
    }

    [Test]
    public void TestSerialization_1()
    {
        var json = """
            {
              "name": "file.txt",
              "contents": "..."
            }
            """;
        var obj = new File { Name = "file.txt", Contents = "..." };
        var objAsNode = JsonUtils.SerializeToNode(obj);
        var jsonAsNode = JsonUtils.Deserialize<JsonNode>(json);
        Assert.That(objAsNode, Is.EqualTo(jsonAsNode).UsingPropertiesComparer());
    }

    [Test]
    public void TestDeserialization_2()
    {
        var json = """
            {
              "name": "another_file.txt",
              "contents": "..."
            }
            """;
        var expectedObject = new File { Name = "another_file.txt", Contents = "..." };
        var deserializedObject = JsonUtils.Deserialize<File>(json);
        var serializedJson = JsonUtils.Serialize(deserializedObject);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingPropertiesComparer());
    }

    [Test]
    public void TestSerialization_2()
    {
        var json = """
            {
              "name": "another_file.txt",
              "contents": "..."
            }
            """;
        var obj = new File { Name = "another_file.txt", Contents = "..." };
        var objAsNode = JsonUtils.SerializeToNode(obj);
        var jsonAsNode = JsonUtils.Deserialize<JsonNode>(json);
        Assert.That(objAsNode, Is.EqualTo(jsonAsNode).UsingPropertiesComparer());
    }
}

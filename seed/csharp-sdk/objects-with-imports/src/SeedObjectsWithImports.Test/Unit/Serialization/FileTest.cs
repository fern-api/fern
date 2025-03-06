using System.Text.Json.Nodes;
using NUnit.Framework;
using SeedObjectsWithImports;
using SeedObjectsWithImports.Core;

namespace SeedObjectsWithImports.Test;

[TestFixture]
public class FileTest
{
    [Test]
    public void TestDeserialization_1()
    {
        var json = """
            {
              "name": "file.txt",
              "contents": "...",
              "info": "REGULAR"
            }
            """;
        var expectedObject = new File
        {
            Name = "file.txt",
            Contents = "...",
            Info = FileInfo.Regular,
        };
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
              "contents": "...",
              "info": "REGULAR"
            }
            """;
        var obj = new File
        {
            Name = "file.txt",
            Contents = "...",
            Info = FileInfo.Regular,
        };
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
              "contents": "...",
              "info": "REGULAR"
            }
            """;
        var expectedObject = new File
        {
            Name = "another_file.txt",
            Contents = "...",
            Info = FileInfo.Regular,
        };
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
              "contents": "...",
              "info": "REGULAR"
            }
            """;
        var obj = new File
        {
            Name = "another_file.txt",
            Contents = "...",
            Info = FileInfo.Regular,
        };
        var objAsNode = JsonUtils.SerializeToNode(obj);
        var jsonAsNode = JsonUtils.Deserialize<JsonNode>(json);
        Assert.That(objAsNode, Is.EqualTo(jsonAsNode).UsingPropertiesComparer());
    }
}

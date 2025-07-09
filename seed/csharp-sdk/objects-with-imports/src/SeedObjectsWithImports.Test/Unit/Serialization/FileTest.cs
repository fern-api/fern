using System.Text.Json;
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
        var expectedObject = new SeedObjectsWithImports.File
        {
            Name = "file.txt",
            Contents = "...",
            Info = FileInfo.Regular,
        };
        var deserializedObject = JsonUtils.Deserialize<SeedObjectsWithImports.File>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization_1()
    {
        var expectedJson = """
            {
              "name": "file.txt",
              "contents": "...",
              "info": "REGULAR"
            }
            """;
        var actualObj = new SeedObjectsWithImports.File
        {
            Name = "file.txt",
            Contents = "...",
            Info = FileInfo.Regular,
        };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
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
        var expectedObject = new SeedObjectsWithImports.File
        {
            Name = "another_file.txt",
            Contents = "...",
            Info = FileInfo.Regular,
        };
        var deserializedObject = JsonUtils.Deserialize<SeedObjectsWithImports.File>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization_2()
    {
        var expectedJson = """
            {
              "name": "another_file.txt",
              "contents": "...",
              "info": "REGULAR"
            }
            """;
        var actualObj = new SeedObjectsWithImports.File
        {
            Name = "another_file.txt",
            Contents = "...",
            Info = FileInfo.Regular,
        };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}

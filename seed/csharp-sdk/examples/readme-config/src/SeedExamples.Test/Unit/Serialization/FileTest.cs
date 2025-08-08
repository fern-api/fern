using System.Text.Json;
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
        var expectedObject = new SeedExamples.File { Name = "file.txt", Contents = "..." };
        var deserializedObject = JsonUtils.Deserialize<SeedExamples.File>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization_1()
    {
        var expectedJson = """
            {
              "name": "file.txt",
              "contents": "..."
            }
            """;
        var actualObj = new SeedExamples.File { Name = "file.txt", Contents = "..." };
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
              "contents": "..."
            }
            """;
        var expectedObject = new SeedExamples.File { Name = "another_file.txt", Contents = "..." };
        var deserializedObject = JsonUtils.Deserialize<SeedExamples.File>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization_2()
    {
        var expectedJson = """
            {
              "name": "another_file.txt",
              "contents": "..."
            }
            """;
        var actualObj = new SeedExamples.File { Name = "another_file.txt", Contents = "..." };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}

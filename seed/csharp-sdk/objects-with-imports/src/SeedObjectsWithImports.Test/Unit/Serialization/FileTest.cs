using global::System.Text.Json;
using NUnit.Framework;
using SeedObjectsWithImports.Core;
using SeedObjectsWithImports.Test.Utils;

namespace SeedObjectsWithImports.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class FileTest
{
    [NUnit.Framework.Test]
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
            Info = SeedObjectsWithImports.FileInfo.Regular,
        };
        var deserializedObject = JsonUtils.Deserialize<SeedObjectsWithImports.File>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var inputJson = """
            {
              "name": "file.txt",
              "contents": "...",
              "info": "REGULAR"
            }
            """;
        JsonAssert.Roundtrips<SeedObjectsWithImports.File>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestModelBinding_1()
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
            Info = SeedObjectsWithImports.FileInfo.Regular,
        };
        var options = new global::System.Text.Json.JsonSerializerOptions(
            global::System.Text.Json.JsonSerializerDefaults.Web
        );
        var deserializedObject = JsonSerializer.Deserialize<SeedObjectsWithImports.File>(
            json,
            options
        );
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
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
            Info = SeedObjectsWithImports.FileInfo.Regular,
        };
        var deserializedObject = JsonUtils.Deserialize<SeedObjectsWithImports.File>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "name": "another_file.txt",
              "contents": "...",
              "info": "REGULAR"
            }
            """;
        JsonAssert.Roundtrips<SeedObjectsWithImports.File>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestModelBinding_2()
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
            Info = SeedObjectsWithImports.FileInfo.Regular,
        };
        var options = new global::System.Text.Json.JsonSerializerOptions(
            global::System.Text.Json.JsonSerializerDefaults.Web
        );
        var deserializedObject = JsonSerializer.Deserialize<SeedObjectsWithImports.File>(
            json,
            options
        );
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }
}

using NUnit.Framework;
using SeedExamples.Core;
using SeedExamples.Test_.Utils;

namespace SeedExamples.Test_;

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
              "contents": "..."
            }
            """;
        var expectedObject = new SeedExamples.File { Name = "file.txt", Contents = "..." };
        var deserializedObject = JsonUtils.Deserialize<SeedExamples.File>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var inputJson = """
            {
              "name": "file.txt",
              "contents": "..."
            }
            """;
        JsonAssert.Roundtrips<SeedExamples.File>(inputJson);
    }

    [NUnit.Framework.Test]
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

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "name": "another_file.txt",
              "contents": "..."
            }
            """;
        JsonAssert.Roundtrips<SeedExamples.File>(inputJson);
    }
}

using NUnit.Framework;
using SeedObject;
using SeedObject.Core;
using SeedObject.Test.Utils;

namespace SeedObject.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class NameTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "id": "name-sdfg8ajk",
              "value": "name"
            }
            """;
        var expectedObject = new Name { Id = "name-sdfg8ajk", Value = "name" };
        var deserializedObject = JsonUtils.Deserialize<Name>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "id": "name-sdfg8ajk",
              "value": "name"
            }
            """;
        JsonAssert.Roundtrips<Name>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestModelBinding()
    {
        var json = """
            {
              "id": "name-sdfg8ajk",
              "value": "name"
            }
            """;
        var expectedObject = new Name { Id = "name-sdfg8ajk", Value = "name" };
        var options = new global::System.Text.Json.JsonSerializerOptions(
            global::System.Text.Json.JsonSerializerDefaults.Web
        );
        var deserializedObject = global::System.Text.Json.JsonSerializer.Deserialize<Name>(
            json,
            options
        );
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }
}

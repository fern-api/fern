using NUnit.Framework;
using SeedAliasExtends;
using SeedAliasExtends.Core;
using SeedAliasExtends.Test.Utils;

namespace SeedAliasExtends.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class ParentTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "parent": "Property from the parent"
            }
            """;
        var expectedObject = new Parent { Parent_ = "Property from the parent" };
        var deserializedObject = JsonUtils.Deserialize<Parent>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "parent": "Property from the parent"
            }
            """;
        JsonAssert.Roundtrips<Parent>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestModelBinding()
    {
        var json = """
            {
              "parent": "Property from the parent"
            }
            """;
        var expectedObject = new Parent { Parent_ = "Property from the parent" };
        var options = new global::System.Text.Json.JsonSerializerOptions(
            global::System.Text.Json.JsonSerializerDefaults.Web
        );
        var deserializedObject = global::System.Text.Json.JsonSerializer.Deserialize<Parent>(
            json,
            options
        );
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }
}

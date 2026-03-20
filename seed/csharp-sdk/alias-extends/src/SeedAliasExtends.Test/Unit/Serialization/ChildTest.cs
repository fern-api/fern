using NUnit.Framework;
using SeedAliasExtends;
using SeedAliasExtends.Core;
using SeedAliasExtends.Test.Utils;

namespace SeedAliasExtends.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class ChildTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "parent": "Property from the parent",
              "child": "Property from the child"
            }
            """;
        var expectedObject = new Child
        {
            Parent = "Property from the parent",
            Child_ = "Property from the child",
        };
        var deserializedObject = JsonUtils.Deserialize<Child>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "parent": "Property from the parent",
              "child": "Property from the child"
            }
            """;
        JsonAssert.Roundtrips<Child>(inputJson);
    }
}

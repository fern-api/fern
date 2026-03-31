using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UnionWithDuplicateTypesTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization_1()
    {
        var json = """
            {
              "type": "foo1",
              "name": "example1"
            }
            """;
        var expectedObject = new UnionWithDuplicateTypes(
            new UnionWithDuplicateTypes.Foo1(new Foo { Name = "example1" })
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithDuplicateTypes>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var inputJson = """
            {
              "type": "foo1",
              "name": "example1"
            }
            """;
        JsonAssert.Roundtrips<UnionWithDuplicateTypes>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_2()
    {
        var json = """
            {
              "type": "foo2",
              "name": "example2"
            }
            """;
        var expectedObject = new UnionWithDuplicateTypes(
            new UnionWithDuplicateTypes.Foo2(new Foo { Name = "example2" })
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithDuplicateTypes>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "type": "foo2",
              "name": "example2"
            }
            """;
        JsonAssert.Roundtrips<UnionWithDuplicateTypes>(inputJson);
    }
}

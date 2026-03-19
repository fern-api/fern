using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UnionWithSubTypesTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization_1()
    {
        var json = """
            {
              "type": "foo",
              "name": "example1"
            }
            """;
        var expectedObject = new UnionWithSubTypes(
            new UnionWithSubTypes.Foo(new Foo { Name = "example1" })
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithSubTypes>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var inputJson = """
            {
              "type": "foo",
              "name": "example1"
            }
            """;
        JsonAssert.Roundtrips<UnionWithSubTypes>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_2()
    {
        var json = """
            {
              "type": "fooExtended",
              "name": "example2",
              "age": 5
            }
            """;
        var expectedObject = new UnionWithSubTypes(
            new UnionWithSubTypes.FooExtended(new FooExtended { Name = "example2", Age = 5 })
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithSubTypes>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "type": "fooExtended",
              "name": "example2",
              "age": 5
            }
            """;
        JsonAssert.Roundtrips<UnionWithSubTypes>(inputJson);
    }
}

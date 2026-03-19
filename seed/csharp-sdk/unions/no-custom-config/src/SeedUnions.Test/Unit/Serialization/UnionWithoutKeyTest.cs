using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UnionWithoutKeyTest
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
        var expectedObject = new UnionWithoutKey(
            new UnionWithoutKey.Foo(new Foo { Name = "example1" })
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithoutKey>(json);
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
        JsonAssert.Roundtrips<UnionWithoutKey>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_2()
    {
        var json = """
            {
              "type": "bar",
              "name": "example1"
            }
            """;
        var expectedObject = new UnionWithoutKey(
            new UnionWithoutKey.Bar(new Bar { Name = "example1" })
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithoutKey>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "type": "bar",
              "name": "example1"
            }
            """;
        JsonAssert.Roundtrips<UnionWithoutKey>(inputJson);
    }
}

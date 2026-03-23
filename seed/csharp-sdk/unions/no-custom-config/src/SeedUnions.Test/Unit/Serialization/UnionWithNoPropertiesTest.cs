using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UnionWithNoPropertiesTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization_1()
    {
        var json = """
            {
              "type": "foo",
              "name": "example"
            }
            """;
        var expectedObject = new UnionWithNoProperties(
            new UnionWithNoProperties.Foo(new Foo { Name = "example" })
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithNoProperties>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var inputJson = """
            {
              "type": "foo",
              "name": "example"
            }
            """;
        JsonAssert.Roundtrips<UnionWithNoProperties>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_2()
    {
        var json = """
            {
              "type": "empty"
            }
            """;
        var expectedObject = new UnionWithNoProperties(new UnionWithNoProperties.Empty());
        var deserializedObject = JsonUtils.Deserialize<UnionWithNoProperties>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "type": "empty"
            }
            """;
        JsonAssert.Roundtrips<UnionWithNoProperties>(inputJson);
    }
}

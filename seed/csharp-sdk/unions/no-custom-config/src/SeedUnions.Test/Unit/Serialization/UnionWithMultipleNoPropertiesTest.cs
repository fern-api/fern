using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UnionWithMultipleNoPropertiesTest
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
        var expectedObject = new UnionWithMultipleNoProperties(
            new UnionWithMultipleNoProperties.Foo(new Foo { Name = "example" })
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithMultipleNoProperties>(json);
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
        JsonAssert.Roundtrips<UnionWithMultipleNoProperties>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_2()
    {
        var json = """
            {
              "type": "empty1"
            }
            """;
        var expectedObject = new UnionWithMultipleNoProperties(
            new UnionWithMultipleNoProperties.Empty1()
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithMultipleNoProperties>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "type": "empty1"
            }
            """;
        JsonAssert.Roundtrips<UnionWithMultipleNoProperties>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_3()
    {
        var json = """
            {
              "type": "empty2"
            }
            """;
        var expectedObject = new UnionWithMultipleNoProperties(
            new UnionWithMultipleNoProperties.Empty2()
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithMultipleNoProperties>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_3()
    {
        var inputJson = """
            {
              "type": "empty2"
            }
            """;
        JsonAssert.Roundtrips<UnionWithMultipleNoProperties>(inputJson);
    }
}

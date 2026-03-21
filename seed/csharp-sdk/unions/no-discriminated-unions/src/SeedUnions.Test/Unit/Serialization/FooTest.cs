using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class FooTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization_1()
    {
        var json = """
            {
              "name": "example1"
            }
            """;
        var expectedObject = new Foo { Name = "example1" };
        var deserializedObject = JsonUtils.Deserialize<Foo>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var inputJson = """
            {
              "name": "example1"
            }
            """;
        JsonAssert.Roundtrips<Foo>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_2()
    {
        var json = """
            {
              "name": "example2"
            }
            """;
        var expectedObject = new Foo { Name = "example2" };
        var deserializedObject = JsonUtils.Deserialize<Foo>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "name": "example2"
            }
            """;
        JsonAssert.Roundtrips<Foo>(inputJson);
    }
}

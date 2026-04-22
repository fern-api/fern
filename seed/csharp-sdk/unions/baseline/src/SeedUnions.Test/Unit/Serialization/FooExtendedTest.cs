using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class FooExtendedTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization_1()
    {
        var json = """
            {
              "name": "example1",
              "age": 5
            }
            """;
        var expectedObject = new FooExtended { Name = "example1", Age = 5 };
        var deserializedObject = JsonUtils.Deserialize<FooExtended>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var inputJson = """
            {
              "name": "example1",
              "age": 5
            }
            """;
        JsonAssert.Roundtrips<FooExtended>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_2()
    {
        var json = """
            {
              "name": "example2",
              "age": 10
            }
            """;
        var expectedObject = new FooExtended { Name = "example2", Age = 10 };
        var deserializedObject = JsonUtils.Deserialize<FooExtended>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "name": "example2",
              "age": 10
            }
            """;
        JsonAssert.Roundtrips<FooExtended>(inputJson);
    }
}

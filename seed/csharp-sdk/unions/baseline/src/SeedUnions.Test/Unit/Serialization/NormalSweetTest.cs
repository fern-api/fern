using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class NormalSweetTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization_1()
    {
        var json = """
            {
              "value": "example1"
            }
            """;
        var expectedObject = new NormalSweet { Value = "example1" };
        var deserializedObject = JsonUtils.Deserialize<NormalSweet>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var inputJson = """
            {
              "value": "example1"
            }
            """;
        JsonAssert.Roundtrips<NormalSweet>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_2()
    {
        var json = """
            {
              "value": "example2"
            }
            """;
        var expectedObject = new NormalSweet { Value = "example2" };
        var deserializedObject = JsonUtils.Deserialize<NormalSweet>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "value": "example2"
            }
            """;
        JsonAssert.Roundtrips<NormalSweet>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_3()
    {
        var json = """
            {
              "value": "example3"
            }
            """;
        var expectedObject = new NormalSweet { Value = "example3" };
        var deserializedObject = JsonUtils.Deserialize<NormalSweet>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_3()
    {
        var inputJson = """
            {
              "value": "example3"
            }
            """;
        JsonAssert.Roundtrips<NormalSweet>(inputJson);
    }
}

using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class BarTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization_1()
    {
        var json = """
            {
              "name": "example1"
            }
            """;
        var expectedObject = new Bar { Name = "example1" };
        var deserializedObject = JsonUtils.Deserialize<Bar>(json);
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
        JsonAssert.Roundtrips<Bar>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_2()
    {
        var json = """
            {
              "name": "example2"
            }
            """;
        var expectedObject = new Bar { Name = "example2" };
        var deserializedObject = JsonUtils.Deserialize<Bar>(json);
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
        JsonAssert.Roundtrips<Bar>(inputJson);
    }
}

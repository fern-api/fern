using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class ThankfulFactorTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization_1()
    {
        var json = """
            {
              "value": "example1"
            }
            """;
        var expectedObject = new ThankfulFactor { Value = "example1" };
        var deserializedObject = JsonUtils.Deserialize<ThankfulFactor>(json);
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
        JsonAssert.Roundtrips<ThankfulFactor>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_2()
    {
        var json = """
            {
              "value": "example2"
            }
            """;
        var expectedObject = new ThankfulFactor { Value = "example2" };
        var deserializedObject = JsonUtils.Deserialize<ThankfulFactor>(json);
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
        JsonAssert.Roundtrips<ThankfulFactor>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_3()
    {
        var json = """
            {
              "value": "example3"
            }
            """;
        var expectedObject = new ThankfulFactor { Value = "example3" };
        var deserializedObject = JsonUtils.Deserialize<ThankfulFactor>(json);
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
        JsonAssert.Roundtrips<ThankfulFactor>(inputJson);
    }
}

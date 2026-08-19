using NUnit.Framework;
using SeedExamples.Core;
using SeedExamples.Test_.Utils;

namespace SeedExamples.Test_;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class TestTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization_1()
    {
        var json = """
            {
              "type": "and",
              "value": true
            }
            """;
        var expectedObject = new SeedExamples.Test(new SeedExamples.Test.And(true));
        var deserializedObject = JsonUtils.Deserialize<SeedExamples.Test>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var inputJson = """
            {
              "type": "and",
              "value": true
            }
            """;
        JsonAssert.Roundtrips<SeedExamples.Test>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_2()
    {
        var json = """
            {
              "type": "or",
              "value": true
            }
            """;
        var expectedObject = new SeedExamples.Test(new SeedExamples.Test.Or(true));
        var deserializedObject = JsonUtils.Deserialize<SeedExamples.Test>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "type": "or",
              "value": true
            }
            """;
        JsonAssert.Roundtrips<SeedExamples.Test>(inputJson);
    }
}

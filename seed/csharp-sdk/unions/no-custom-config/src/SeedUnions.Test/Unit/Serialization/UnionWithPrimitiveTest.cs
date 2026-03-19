using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UnionWithPrimitiveTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization_1()
    {
        var json = """
            {
              "type": "integer",
              "value": 9
            }
            """;
        var expectedObject = new UnionWithPrimitive(new UnionWithPrimitive.Integer(9));
        var deserializedObject = JsonUtils.Deserialize<UnionWithPrimitive>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var inputJson = """
            {
              "type": "integer",
              "value": 9
            }
            """;
        JsonAssert.Roundtrips<UnionWithPrimitive>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_2()
    {
        var json = """
            {
              "type": "string",
              "value": "bar"
            }
            """;
        var expectedObject = new UnionWithPrimitive(new UnionWithPrimitive.String("bar"));
        var deserializedObject = JsonUtils.Deserialize<UnionWithPrimitive>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "type": "string",
              "value": "bar"
            }
            """;
        JsonAssert.Roundtrips<UnionWithPrimitive>(inputJson);
    }
}

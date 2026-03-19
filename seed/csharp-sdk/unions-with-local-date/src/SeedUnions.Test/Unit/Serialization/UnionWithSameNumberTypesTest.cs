using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UnionWithSameNumberTypesTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization_1()
    {
        var json = """
            {
              "type": "positiveInt",
              "value": 100
            }
            """;
        var expectedObject = new UnionWithSameNumberTypes(
            new UnionWithSameNumberTypes.PositiveInt(100)
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithSameNumberTypes>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var inputJson = """
            {
              "type": "positiveInt",
              "value": 100
            }
            """;
        JsonAssert.Roundtrips<UnionWithSameNumberTypes>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_2()
    {
        var json = """
            {
              "type": "negativeInt",
              "value": -50
            }
            """;
        var expectedObject = new UnionWithSameNumberTypes(
            new UnionWithSameNumberTypes.NegativeInt(-50)
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithSameNumberTypes>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "type": "negativeInt",
              "value": -50
            }
            """;
        JsonAssert.Roundtrips<UnionWithSameNumberTypes>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_3()
    {
        var json = """
            {
              "type": "anyNumber",
              "value": 3.14159
            }
            """;
        var expectedObject = new UnionWithSameNumberTypes(
            new UnionWithSameNumberTypes.AnyNumber(3.14159)
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithSameNumberTypes>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_3()
    {
        var inputJson = """
            {
              "type": "anyNumber",
              "value": 3.14159
            }
            """;
        JsonAssert.Roundtrips<UnionWithSameNumberTypes>(inputJson);
    }
}

using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UnionWithSameStringTypesTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization_1()
    {
        var json = """
            {
              "type": "customFormat",
              "value": "custom-123"
            }
            """;
        var expectedObject = new UnionWithSameStringTypes(
            new UnionWithSameStringTypes.CustomFormat("custom-123")
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithSameStringTypes>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var inputJson = """
            {
              "type": "customFormat",
              "value": "custom-123"
            }
            """;
        JsonAssert.Roundtrips<UnionWithSameStringTypes>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_2()
    {
        var json = """
            {
              "type": "regularString",
              "value": "regular text"
            }
            """;
        var expectedObject = new UnionWithSameStringTypes(
            new UnionWithSameStringTypes.RegularString("regular text")
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithSameStringTypes>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "type": "regularString",
              "value": "regular text"
            }
            """;
        JsonAssert.Roundtrips<UnionWithSameStringTypes>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_3()
    {
        var json = """
            {
              "type": "patternString",
              "value": "PATTERN123"
            }
            """;
        var expectedObject = new UnionWithSameStringTypes(
            new UnionWithSameStringTypes.PatternString("PATTERN123")
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithSameStringTypes>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_3()
    {
        var inputJson = """
            {
              "type": "patternString",
              "value": "PATTERN123"
            }
            """;
        JsonAssert.Roundtrips<UnionWithSameStringTypes>(inputJson);
    }
}

using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UnionWithGlobalNameCollisionsTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization_1()
    {
        var json = """
            {
              "type": "Date",
              "value": "collides-with-the-js-global"
            }
            """;
        var expectedObject = new UnionWithGlobalNameCollisions(
            new UnionWithGlobalNameCollisions.Date("collides-with-the-js-global")
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithGlobalNameCollisions>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var inputJson = """
            {
              "type": "Date",
              "value": "collides-with-the-js-global"
            }
            """;
        JsonAssert.Roundtrips<UnionWithGlobalNameCollisions>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_2()
    {
        var json = """
            {
              "type": "Aim",
              "value": "no-collision"
            }
            """;
        var expectedObject = new UnionWithGlobalNameCollisions(
            new UnionWithGlobalNameCollisions.Aim("no-collision")
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithGlobalNameCollisions>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "type": "Aim",
              "value": "no-collision"
            }
            """;
        JsonAssert.Roundtrips<UnionWithGlobalNameCollisions>(inputJson);
    }
}

using NUnit.Framework;
using SeedValidation;
using SeedValidation.Core;
using SeedValidation.Test.Utils;

namespace SeedValidation.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class TypeTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "decimal": 1.1,
              "even": 2,
              "name": "rules",
              "shape": "SQUARE"
            }
            """;
        var expectedObject = new SeedValidation.Type
        {
            Decimal = 1.1,
            Even = 2,
            Name = "rules",
            Shape = Shape.Square,
        };
        var deserializedObject = JsonUtils.Deserialize<SeedValidation.Type>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "decimal": 1.1,
              "even": 2,
              "name": "rules",
              "shape": "SQUARE"
            }
            """;
        JsonAssert.Roundtrips<SeedValidation.Type>(inputJson);
    }
}

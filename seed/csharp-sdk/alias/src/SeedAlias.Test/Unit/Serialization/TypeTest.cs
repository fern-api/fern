using NUnit.Framework;
using SeedAlias.Core;
using SeedAlias.Test.Utils;

namespace SeedAlias.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class TypeTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "id": "type-df89sdg1",
              "name": "foo"
            }
            """;
        var expectedObject = new SeedAlias.Type { Id = "type-df89sdg1", Name = "foo" };
        var deserializedObject = JsonUtils.Deserialize<SeedAlias.Type>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "id": "type-df89sdg1",
              "name": "foo"
            }
            """;
        JsonAssert.Roundtrips<SeedAlias.Type>(inputJson);
    }
}

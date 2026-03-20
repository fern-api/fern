using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetShapeRequestTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "id": "example"
            }
            """;
        var expectedObject = new GetShapeRequest { Id = "example" };
        var deserializedObject = JsonUtils.Deserialize<GetShapeRequest>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "id": "example"
            }
            """;
        JsonAssert.Roundtrips<GetShapeRequest>(inputJson);
    }
}

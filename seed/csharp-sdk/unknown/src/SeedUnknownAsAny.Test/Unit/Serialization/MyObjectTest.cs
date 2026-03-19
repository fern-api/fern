using NUnit.Framework;
using SeedUnknownAsAny;
using SeedUnknownAsAny.Core;
using SeedUnknownAsAny.Test.Utils;

namespace SeedUnknownAsAny.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class MyObjectTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "unknown": {
                "boolVal": true,
                "strVal": "string"
              }
            }
            """;
        var expectedObject = new MyObject
        {
            Unknown = new Dictionary<object, object?>()
            {
                { "boolVal", true },
                { "strVal", "string" },
            },
        };
        var deserializedObject = JsonUtils.Deserialize<MyObject>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "unknown": {
                "boolVal": true,
                "strVal": "string"
              }
            }
            """;
        JsonAssert.Roundtrips<MyObject>(inputJson);
    }
}

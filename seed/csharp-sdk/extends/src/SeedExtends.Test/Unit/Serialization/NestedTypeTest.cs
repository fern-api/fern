using NUnit.Framework;
using SeedExtends;
using SeedExtends.Core;
using SeedExtends.Test.Utils;

namespace SeedExtends.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class NestedTypeTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "docs": "This is an example nested type.",
              "name": "NestedExample",
              "raw": "{\"nested\": \"example\"}"
            }
            """;
        var expectedObject = new NestedType
        {
            Docs = "This is an example nested type.",
            Name = "NestedExample",
            Raw = "{\"nested\": \"example\"}",
        };
        var deserializedObject = JsonUtils.Deserialize<NestedType>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "docs": "This is an example nested type.",
              "name": "NestedExample",
              "raw": "{\"nested\": \"example\"}"
            }
            """;
        JsonAssert.Roundtrips<NestedType>(inputJson);
    }
}

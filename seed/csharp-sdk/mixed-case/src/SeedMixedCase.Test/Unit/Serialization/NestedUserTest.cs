using NUnit.Framework;
using SeedMixedCase;
using SeedMixedCase.Core;
using SeedMixedCase.Test.Utils;

namespace SeedMixedCase.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class NestedUserTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "Name": "username",
              "NestedUser": {
                "userName": "nestedUsername",
                "metadata_tags": [
                  "tag1",
                  "tag2"
                ],
                "EXTRA_PROPERTIES": {
                  "foo": "bar",
                  "baz": "qux"
                }
              }
            }
            """;
        var expectedObject = new NestedUser
        {
            Name = "username",
            NestedUser_ = new User
            {
                UserName = "nestedUsername",
                MetadataTags = new List<string>() { "tag1", "tag2" },
                ExtraProperties = new Dictionary<string, string>()
                {
                    { "foo", "bar" },
                    { "baz", "qux" },
                },
            },
        };
        var deserializedObject = JsonUtils.Deserialize<NestedUser>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "Name": "username",
              "NestedUser": {
                "userName": "nestedUsername",
                "metadata_tags": [
                  "tag1",
                  "tag2"
                ],
                "EXTRA_PROPERTIES": {
                  "foo": "bar",
                  "baz": "qux"
                }
              }
            }
            """;
        JsonAssert.Roundtrips<NestedUser>(inputJson);
    }
}

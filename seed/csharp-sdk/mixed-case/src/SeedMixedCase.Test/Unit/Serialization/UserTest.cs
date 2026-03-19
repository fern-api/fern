using NUnit.Framework;
using SeedMixedCase;
using SeedMixedCase.Core;
using SeedMixedCase.Test.Utils;

namespace SeedMixedCase.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UserTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "userName": "username",
              "metadata_tags": [
                "tag1",
                "tag2"
              ],
              "EXTRA_PROPERTIES": {
                "foo": "bar",
                "baz": "qux"
              }
            }
            """;
        var expectedObject = new User
        {
            UserName = "username",
            MetadataTags = new List<string>() { "tag1", "tag2" },
            ExtraProperties = new Dictionary<string, string>()
            {
                { "foo", "bar" },
                { "baz", "qux" },
            },
        };
        var deserializedObject = JsonUtils.Deserialize<User>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "userName": "username",
              "metadata_tags": [
                "tag1",
                "tag2"
              ],
              "EXTRA_PROPERTIES": {
                "foo": "bar",
                "baz": "qux"
              }
            }
            """;
        JsonAssert.Roundtrips<User>(inputJson);
    }
}

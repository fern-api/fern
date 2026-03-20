using NUnit.Framework;
using SeedMixedCase;
using SeedMixedCase.Core;
using SeedMixedCase.Test.Utils;

namespace SeedMixedCase.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class OrganizationTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "name": "orgName"
            }
            """;
        var expectedObject = new Organization { Name = "orgName" };
        var deserializedObject = JsonUtils.Deserialize<Organization>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "name": "orgName"
            }
            """;
        JsonAssert.Roundtrips<Organization>(inputJson);
    }
}

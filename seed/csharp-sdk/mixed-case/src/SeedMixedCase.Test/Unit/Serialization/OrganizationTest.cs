using System.Text.Json;
using NUnit.Framework;
using SeedMixedCase;
using SeedMixedCase.Core;

namespace SeedMixedCase.Test;

[TestFixture]
public class OrganizationTest
{
    [Test]
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

    [Test]
    public void TestSerialization()
    {
        var expectedJson = """
            {
              "name": "orgName"
            }
            """;
        var actualObj = new Organization { Name = "orgName" };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}

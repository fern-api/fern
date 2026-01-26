using System.Text.Json;
using NUnit.Framework;
using SeedExtraProperties;
using SeedExtraProperties.Core;

namespace SeedExtraProperties.Test;

[TestFixture]
public class UserTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "name": "Alice",
              "age": 30,
              "location": "Wonderland"
            }
            """;
        var expectedObject = new User
        {
            Name = "Alice",
            AdditionalProperties = new AdditionalProperties
            {
                ["age"] = 30,
                ["location"] = "Wonderland",
            },
        };
        var deserializedObject = JsonUtils.Deserialize<User>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var expectedJson = """
            {
              "name": "Alice",
              "age": 30,
              "location": "Wonderland"
            }
            """;
        var actualObj = new User
        {
            Name = "Alice",
            AdditionalProperties = new AdditionalProperties
            {
                ["age"] = 30,
                ["location"] = "Wonderland",
            },
        };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}

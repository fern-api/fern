using System.Text.Json;
using System.Text.Json.Serialization;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedAliasExtends;

#nullable enable

namespace SeedAliasExtends.Test;

[TestFixture]
public class ChildTest
{
    [Test]
    public void TestSerialization()
    {
        var inputJson =
            @"
        {
  ""parent"": ""Property from the parent"",
  ""child"": ""Property from the child""
}
";

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        var deserializedObject = JsonSerializer.Deserialize<Child>(inputJson, serializerOptions);

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);

        Assert.That(JToken.DeepEquals(JToken.Parse(inputJson), JToken.Parse(serializedJson)));
    }
}

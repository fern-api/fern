using System.Text.Json;
using System.Text.Json.Serialization;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedExamples;

#nullable enable

namespace SeedExamples.Test;

[TestFixture]
public class TreeTest
{
    [Test]
    public void TestSerialization()
    {
        var inputJson =
            @"
        {
  ""nodes"": [
    {
      ""name"": ""left""
    },
    {
      ""name"": ""right""
    }
  ]
}
";

        var expectedObject = new Tree
        {
            Nodes = new List<Node>()
            {
                new Node { Name = "left" },
                new Node { Name = "right" }
            }
        };

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        var deserializedObject = JsonSerializer.Deserialize<Tree>(inputJson, serializerOptions);
        Assert.That(expectedObject, Is.EqualTo(deserializedObject));

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);
        Assert.That(JToken.DeepEquals(JToken.Parse(inputJson), JToken.Parse(serializedJson)));
    }
}

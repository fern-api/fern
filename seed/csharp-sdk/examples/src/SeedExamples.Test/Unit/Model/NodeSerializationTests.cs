using System.Text.Json;
using System.Text.Json.Serialization;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedExamples;

#nullable enable

namespace SeedExamples.Test;

[TestFixture]
public class NodeSerializationTests
{
    [Test]
    public void NodeSerializationTest_1()
    {
        var inputJson =
            @"
        {
  ""name"": ""root"",
  ""nodes"": [
    {
      ""name"": ""left""
    },
    {
      ""name"": ""right""
    }
  ],
  ""trees"": [
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
  ]
}
";

        var expectedObject = new Node
        {
            Name = "root",
            Nodes = new List<Node>()
            {
                new Node { Name = "left" },
                new Node { Name = "right" }
            },
            Trees = new List<Tree>()
            {
                new Tree
                {
                    Nodes = new List<Node>()
                    {
                        new Node { Name = "left" },
                        new Node { Name = "right" }
                    }
                }
            }
        };

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        var deserializedObject = JsonSerializer.Deserialize<Node>(inputJson, serializerOptions);
        Assert.That(expectedObject, Is.EqualTo(deserializedObject));

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);
        Assert.That(JToken.DeepEquals(JToken.Parse(inputJson), JToken.Parse(serializedJson)));
    }

    [Test]
    public void NodeSerializationTest_2()
    {
        var inputJson =
            @"
        {
  ""name"": ""left""
}
";

        var expectedObject = new Node { Name = "left" };

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        var deserializedObject = JsonSerializer.Deserialize<Node>(inputJson, serializerOptions);
        Assert.That(expectedObject, Is.EqualTo(deserializedObject));

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);
        Assert.That(JToken.DeepEquals(JToken.Parse(inputJson), JToken.Parse(serializedJson)));
    }

    [Test]
    public void NodeSerializationTest_3()
    {
        var inputJson =
            @"
        {
  ""name"": ""right""
}
";

        var expectedObject = new Node { Name = "right" };

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        var deserializedObject = JsonSerializer.Deserialize<Node>(inputJson, serializerOptions);
        Assert.That(expectedObject, Is.EqualTo(deserializedObject));

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);
        Assert.That(JToken.DeepEquals(JToken.Parse(inputJson), JToken.Parse(serializedJson)));
    }
}

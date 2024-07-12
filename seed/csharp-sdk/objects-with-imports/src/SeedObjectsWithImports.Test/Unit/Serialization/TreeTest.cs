using System.Text.Json;
using System.Text.Json.Serialization;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedObjectsWithImports;

#nullable enable

namespace SeedObjectsWithImports.Test;

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
      ""id"": ""node-8dvgfja2"",
      ""label"": ""left"",
      ""metadata"": {
        ""id"": ""metadata-kjasf923"",
        ""data"": {
          ""foo"": ""bar"",
          ""baz"": ""qux""
        }
      }
    },
    {
      ""id"": ""node-cwda9fi2x"",
      ""label"": ""right"",
      ""metadata"": {
        ""id"": ""metadata-lkasdfv9j"",
        ""data"": {
          ""one"": ""two"",
          ""three"": ""four""
        }
      }
    }
  ]
}
";

        var expectedObject = new Tree
        {
            Nodes = new List<Node>()
            {
                new Node
                {
                    Id = "node-8dvgfja2",
                    Label = "left",
                    Metadata = new Metadata
                    {
                        Id = "metadata-kjasf923",
                        Data = new Dictionary<string, string>()
                        {
                            { "foo", "bar" },
                            { "baz", "qux" },
                        }
                    }
                },
                new Node
                {
                    Id = "node-cwda9fi2x",
                    Label = "right",
                    Metadata = new Metadata
                    {
                        Id = "metadata-lkasdfv9j",
                        Data = new Dictionary<string, string>()
                        {
                            { "one", "two" },
                            { "three", "four" },
                        }
                    }
                }
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

using NUnit.Framework;
using System.Text.Json.Serialization;
using System.Text.Json;
using SeedExamples;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;

    namespace SeedExamples.Test;

[TestFixture]
public class DirectoryTest
{
    [Test]
    public void TestSerialization() {
        var inputJson = 
        @"
        {
          ""name"": ""root"",
          ""files"": [
            {
              ""name"": ""file.txt"",
              ""contents"": ""...""
            }
          ],
          ""directories"": [
            {
              ""name"": ""tmp"",
              ""files"": [
                {
                  ""name"": ""another_file.txt"",
                  ""contents"": ""...""
                }
              ]
            }
          ]
        }
        ";

        var serializerOptions  = new JsonSerializerOptions { DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull };
        
        var deserializedObject = JsonSerializer.Deserialize<Directory>(inputJson, serializerOptions);

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);

        JToken.Parse(inputJson).Should().BeEquivalentTo(JToken.Parse(serializedJson));
    }

}

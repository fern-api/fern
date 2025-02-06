using NUnit.Framework;
using System.Text.Json.Serialization;
using System.Text.Json;
using SeedObjectsWithImports.File;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;

    namespace SeedObjectsWithImports.Test;

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
              ""contents"": ""..."",
              ""info"": ""REGULAR""
            }
          ],
          ""directories"": [
            {
              ""name"": ""tmp"",
              ""files"": [
                {
                  ""name"": ""another_file.txt"",
                  ""contents"": ""..."",
                  ""info"": ""REGULAR""
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

using System.Text.Json;
using System.Text.Json.Serialization;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedObjectsWithImports;
using SeedObjectsWithImports.File;

#nullable enable

namespace SeedObjectsWithImports.Test;

[TestFixture]
public class DirectoryTest
{
    [Test]
    public void TestSerialization()
    {
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

        var expectedObject = new Directory
        {
            Name = "root",
            Files = new List<File>()
            {
                new File
                {
                    Name = "file.txt",
                    Contents = "...",
                    Info = FileInfo.Regular
                }
            },
            Directories = new List<Directory>()
            {
                new Directory
                {
                    Name = "tmp",
                    Files = new List<File>()
                    {
                        new File
                        {
                            Name = "another_file.txt",
                            Contents = "...",
                            Info = FileInfo.Regular
                        }
                    }
                }
            }
        };

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        var deserializedObject = JsonSerializer.Deserialize<Directory>(
            inputJson,
            serializerOptions
        );
        Assert.That(expectedObject, Is.EqualTo(deserializedObject));

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);
        Assert.That(JToken.DeepEquals(JToken.Parse(inputJson), JToken.Parse(serializedJson)));
    }
}

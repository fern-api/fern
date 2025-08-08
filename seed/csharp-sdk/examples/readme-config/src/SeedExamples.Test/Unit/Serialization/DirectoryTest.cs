using System.Text.Json;
using NUnit.Framework;
using SeedExamples.Core;

namespace SeedExamples.Test;

[TestFixture]
public class DirectoryTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "name": "root",
              "files": [
                {
                  "name": "file.txt",
                  "contents": "..."
                }
              ],
              "directories": [
                {
                  "name": "tmp",
                  "files": [
                    {
                      "name": "another_file.txt",
                      "contents": "..."
                    }
                  ]
                }
              ]
            }
            """;
        var expectedObject = new Directory
        {
            Name = "root",
            Files = new List<SeedExamples.File>()
            {
                new SeedExamples.File { Name = "file.txt", Contents = "..." },
            },
            Directories = new List<Directory>()
            {
                new Directory
                {
                    Name = "tmp",
                    Files = new List<SeedExamples.File>()
                    {
                        new SeedExamples.File { Name = "another_file.txt", Contents = "..." },
                    },
                },
            },
        };
        var deserializedObject = JsonUtils.Deserialize<Directory>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization()
    {
        var expectedJson = """
            {
              "name": "root",
              "files": [
                {
                  "name": "file.txt",
                  "contents": "..."
                }
              ],
              "directories": [
                {
                  "name": "tmp",
                  "files": [
                    {
                      "name": "another_file.txt",
                      "contents": "..."
                    }
                  ]
                }
              ]
            }
            """;
        var actualObj = new Directory
        {
            Name = "root",
            Files = new List<SeedExamples.File>()
            {
                new SeedExamples.File { Name = "file.txt", Contents = "..." },
            },
            Directories = new List<Directory>()
            {
                new Directory
                {
                    Name = "tmp",
                    Files = new List<SeedExamples.File>()
                    {
                        new SeedExamples.File { Name = "another_file.txt", Contents = "..." },
                    },
                },
            },
        };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}

using System.Text.Json;
using NUnit.Framework;
using SeedObjectsWithImports.Core;

namespace SeedObjectsWithImports.Test;

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
                  "contents": "...",
                  "info": "REGULAR"
                }
              ],
              "directories": [
                {
                  "name": "tmp",
                  "files": [
                    {
                      "name": "another_file.txt",
                      "contents": "...",
                      "info": "REGULAR"
                    }
                  ]
                }
              ]
            }
            """;
        var expectedObject = new SeedObjectsWithImports.File.Directory
        {
            Name = "root",
            Files = new List<SeedObjectsWithImports.File>()
            {
                new SeedObjectsWithImports.File
                {
                    Name = "file.txt",
                    Contents = "...",
                    Info = FileInfo.Regular,
                },
            },
            Directories = new List<SeedObjectsWithImports.File.Directory>()
            {
                new SeedObjectsWithImports.File.Directory
                {
                    Name = "tmp",
                    Files = new List<SeedObjectsWithImports.File>()
                    {
                        new SeedObjectsWithImports.File
                        {
                            Name = "another_file.txt",
                            Contents = "...",
                            Info = FileInfo.Regular,
                        },
                    },
                },
            },
        };
        var deserializedObject = JsonUtils.Deserialize<SeedObjectsWithImports.File.Directory>(json);
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
                  "contents": "...",
                  "info": "REGULAR"
                }
              ],
              "directories": [
                {
                  "name": "tmp",
                  "files": [
                    {
                      "name": "another_file.txt",
                      "contents": "...",
                      "info": "REGULAR"
                    }
                  ]
                }
              ]
            }
            """;
        var actualObj = new SeedObjectsWithImports.File.Directory
        {
            Name = "root",
            Files = new List<SeedObjectsWithImports.File>()
            {
                new SeedObjectsWithImports.File
                {
                    Name = "file.txt",
                    Contents = "...",
                    Info = FileInfo.Regular,
                },
            },
            Directories = new List<SeedObjectsWithImports.File.Directory>()
            {
                new SeedObjectsWithImports.File.Directory
                {
                    Name = "tmp",
                    Files = new List<SeedObjectsWithImports.File>()
                    {
                        new SeedObjectsWithImports.File
                        {
                            Name = "another_file.txt",
                            Contents = "...",
                            Info = FileInfo.Regular,
                        },
                    },
                },
            },
        };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}

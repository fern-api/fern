using System.Text.Json;
using NUnit.Framework;
using SeedObjectsWithImports;
using SeedObjectsWithImports.Core;
using SeedObjectsWithImports.File;

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
        var expectedObject = new Directory
        {
            Name = "root",
            Files = new List<File>()
            {
                new File
                {
                    Name = "file.txt",
                    Contents = "...",
                    Info = FileInfo.Regular,
                },
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
                            Info = FileInfo.Regular,
                        },
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
        var actualObj = new Directory
        {
            Name = "root",
            Files = new List<File>()
            {
                new File
                {
                    Name = "file.txt",
                    Contents = "...",
                    Info = FileInfo.Regular,
                },
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

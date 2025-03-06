using System.Text.Json.Nodes;
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
        var serializedJson = JsonUtils.Serialize(deserializedObject);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingPropertiesComparer());
    }

    [Test]
    public void TestSerialization()
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
        var obj = new Directory
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
        var objAsNode = JsonUtils.SerializeToNode(obj);
        var jsonAsNode = JsonUtils.Deserialize<JsonNode>(json);
        Assert.That(objAsNode, Is.EqualTo(jsonAsNode).UsingPropertiesComparer());
    }
}

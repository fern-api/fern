using global::System.Threading.Tasks;
using SeedExamples;
using SeedExamples.Commons;
using System.Globalization;

namespace Usage;

public class Example18
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExamplesClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.CreateBigEntityAsync(
            new BigEntity{
                CastMember = new Actor{
                    Name = "name",
                    Id = "id"
                },
                ExtendedMovie = new ExtendedMovie{
                    Cast = new List<string>(){
                        "cast",
                        "cast",
                    },
                    Id = "id",
                    Prequel = "prequel",
                    Title = "title",
                    From = "from",
                    Rating = 1.1,
                    Tag = "tag",
                    Book = "book",
                    Metadata = new Dictionary<string, object>(){
                        ["metadata"] = new Dictionary<string, object>() {
                            ["key"] = "value",
                        },
                    },
                    Revenue = 1000000l
                },
                Entity = new Entity{
                    Type = BasicType.Primitive,
                    Name = "name"
                },
                Metadata = new Metadata(

                ) {
                    Extra = new Dictionary<string, string>(){
                        ["extra"] = "extra",
                    },
                    Tags = new HashSet<string>(){
                        "tags",
                    },
                },
                CommonMetadata = new Metadata{
                    Id = "id",
                    Data = new Dictionary<string, string>(){
                        ["data"] = "data",
                    },
                    JsonString = "jsonString"
                },
                EventInfo = new EventInfo(
                    new Metadata{
                        Id = "id",
                        Data = new Dictionary<string, string>(){
                            ["data"] = "data",
                        },
                        JsonString = "jsonString"
                    }
                ),
                Data = new Data(

                ),
                Migration = new Migration{
                    Name = "name",
                    Status = MigrationStatus.Running
                },
                Exception = new Exception(
                    new ExceptionInfo{
                        ExceptionType = "exceptionType",
                        ExceptionMessage = "exceptionMessage",
                        ExceptionStacktrace = "exceptionStacktrace"
                    }
                ),
                Test = new Test(

                ),
                Node = new Node{
                    Name = "name",
                    Nodes = new List<Node>(){
                        new Node{
                            Name = "name",
                            Nodes = new List<Node>(){
                                new Node{
                                    Name = "name",
                                    Nodes = new List<Node>(){},
                                    Trees = new List<Tree>(){}
                                },
                                new Node{
                                    Name = "name",
                                    Nodes = new List<Node>(){},
                                    Trees = new List<Tree>(){}
                                },
                            },
                            Trees = new List<Tree>(){
                                new Tree{
                                    Nodes = new List<Node>(){}
                                },
                                new Tree{
                                    Nodes = new List<Node>(){}
                                },
                            }
                        },
                        new Node{
                            Name = "name",
                            Nodes = new List<Node>(){
                                new Node{
                                    Name = "name",
                                    Nodes = new List<Node>(){},
                                    Trees = new List<Tree>(){}
                                },
                                new Node{
                                    Name = "name",
                                    Nodes = new List<Node>(){},
                                    Trees = new List<Tree>(){}
                                },
                            },
                            Trees = new List<Tree>(){
                                new Tree{
                                    Nodes = new List<Node>(){}
                                },
                                new Tree{
                                    Nodes = new List<Node>(){}
                                },
                            }
                        },
                    },
                    Trees = new List<Tree>(){
                        new Tree{
                            Nodes = new List<Node>(){
                                new Node{
                                    Name = "name",
                                    Nodes = new List<Node>(){},
                                    Trees = new List<Tree>(){}
                                },
                                new Node{
                                    Name = "name",
                                    Nodes = new List<Node>(){},
                                    Trees = new List<Tree>(){}
                                },
                            }
                        },
                        new Tree{
                            Nodes = new List<Node>(){
                                new Node{
                                    Name = "name",
                                    Nodes = new List<Node>(){},
                                    Trees = new List<Tree>(){}
                                },
                                new Node{
                                    Name = "name",
                                    Nodes = new List<Node>(){},
                                    Trees = new List<Tree>(){}
                                },
                            }
                        },
                    }
                },
                Directory = new Directory{
                    Name = "name",
                    Files = new List<File>(){
                        new File{
                            Name = "name",
                            Contents = "contents"
                        },
                        new File{
                            Name = "name",
                            Contents = "contents"
                        },
                    },
                    Directories = new List<Directory>(){
                        new Directory{
                            Name = "name",
                            Files = new List<File>(){
                                new File{
                                    Name = "name",
                                    Contents = "contents"
                                },
                                new File{
                                    Name = "name",
                                    Contents = "contents"
                                },
                            },
                            Directories = new List<Directory>(){
                                new Directory{
                                    Name = "name",
                                    Files = new List<File>(){},
                                    Directories = new List<Directory>(){}
                                },
                                new Directory{
                                    Name = "name",
                                    Files = new List<File>(){},
                                    Directories = new List<Directory>(){}
                                },
                            }
                        },
                        new Directory{
                            Name = "name",
                            Files = new List<File>(){
                                new File{
                                    Name = "name",
                                    Contents = "contents"
                                },
                                new File{
                                    Name = "name",
                                    Contents = "contents"
                                },
                            },
                            Directories = new List<Directory>(){
                                new Directory{
                                    Name = "name",
                                    Files = new List<File>(){},
                                    Directories = new List<Directory>(){}
                                },
                                new Directory{
                                    Name = "name",
                                    Files = new List<File>(){},
                                    Directories = new List<Directory>(){}
                                },
                            }
                        },
                    }
                },
                Moment = new Moment{
                    Id = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                    Date = DateOnly.Parse("2023-01-15"),
                    Datetime = DateTime.Parse("2024-01-15T09:30:00Z", null, DateTimeStyles.AdjustToUniversal)
                }
            }
        );
    }

}

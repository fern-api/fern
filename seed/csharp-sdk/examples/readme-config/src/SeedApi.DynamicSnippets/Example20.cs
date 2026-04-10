using SeedApi;
using System.Globalization;

namespace Usage;

public class Example20
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.CreatebigentityAsync(
            new BigEntity {
                CastMember = new Actor {
                    Name = "name",
                    Id = "id"
                },
                ExtendedMovie = new ExtendedMovie {
                    Cast = new List<string>(){
                        "cast",
                        "cast",
                    }
                    ,
                    Id = "id",
                    Prequel = "prequel",
                    Title = "title",
                    From = "from",
                    Rating = 1.1,
                    Type = MovieType.Movie,
                    Tag = "tag",
                    Book = "book",
                    Metadata = new Dictionary<string, object?>(){
                        ["metadata"] = new Dictionary<string, object>()
                        {
                            ["key"] = "value",
                        }
                        ,
                    }
                    ,
                    Revenue = 1000000L
                },
                Entity = new Entity {
                    Type = BasicType.Primitive,
                    Name = "name"
                },
                Metadata = new Metadata(
                    new MetadataHtml {
                        Value = "value"
                    }
                ) {
                    Extra = new Dictionary<string, string>(){
                        ["extra"] = "extra",
                    }
                    ,Tags = new List<string>(){
                        "tags",
                        "tags",
                    }
                    ,
                },
                CommonMetadata = new CommonsMetadata {
                    Id = "id",
                    Data = new Dictionary<string, string?>(){
                        ["data"] = "data",
                    }
                    ,
                    JsonString = "jsonString"
                },
                EventInfo = new CommonsEventInfoZero {
                    Type = CommonsEventInfoZeroType.Metadata,
                    Id = "id",
                    Data = new Dictionary<string, string?>(){
                        ["data"] = "data",
                    }
                    ,
                    JsonString = "jsonString"
                },
                Data = new CommonsData(
                    new CommonsDataString {
                        Value = "value"
                    }
                ),
                Migration = new Migration {
                    Name = "name",
                    Status = MigrationStatus.Running
                },
                Exception = new ExceptionZero {
                    Type = ExceptionZeroType.Generic,
                    ExceptionType = "exceptionType",
                    ExceptionMessage = "exceptionMessage",
                    ExceptionStacktrace = "exceptionStacktrace"
                },
                Test = new Test(
                    new TestAnd {
                        Value = true
                    }
                ),
                Node = new Node {
                    Name = "name",
                    Nodes = new List<Node>(){
                        new Node {
                            Name = "name",
                            Nodes = new List<Node>(){
                                new Node {
                                    Name = "name"
                                },
                                new Node {
                                    Name = "name"
                                },
                            }
                            ,
                            Trees = new List<Tree>(){
                                new Tree(),
                                new Tree(),
                            }

                        },
                        new Node {
                            Name = "name",
                            Nodes = new List<Node>(){
                                new Node {
                                    Name = "name"
                                },
                                new Node {
                                    Name = "name"
                                },
                            }
                            ,
                            Trees = new List<Tree>(){
                                new Tree(),
                                new Tree(),
                            }

                        },
                    }
                    ,
                    Trees = new List<Tree>(){
                        new Tree {
                            Nodes = new List<Node>()
                        },
                        new Tree {
                            Nodes = new List<Node>()
                        },
                    }

                },
                Directory = new SeedApi.Directory {
                    Name = "name",
                    Files = new List<SeedApi.File>(){
                        new SeedApi.File {
                            Name = "name",
                            Contents = "contents"
                        },
                        new SeedApi.File {
                            Name = "name",
                            Contents = "contents"
                        },
                    }
                    ,
                    Directories = new List<SeedApi.Directory>(){
                        new SeedApi.Directory {
                            Name = "name",
                            Files = new List<SeedApi.File>(),
                            Directories = new List<SeedApi.Directory>(){
                                new SeedApi.Directory {
                                    Name = "name"
                                },
                                new SeedApi.Directory {
                                    Name = "name"
                                },
                            }

                        },
                        new SeedApi.Directory {
                            Name = "name",
                            Files = new List<SeedApi.File>(),
                            Directories = new List<SeedApi.Directory>(){
                                new SeedApi.Directory {
                                    Name = "name"
                                },
                                new SeedApi.Directory {
                                    Name = "name"
                                },
                            }

                        },
                    }

                },
                Moment = new Moment {
                    Id = "id",
                    Date = DateOnly.Parse("2023-01-15"),
                    Datetime = DateTime.Parse("2024-01-15T09:30:00Z", null, DateTimeStyles.AdjustToUniversal)
                }
            }
        );
    }

}

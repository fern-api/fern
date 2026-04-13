using SeedApi;
using System.Globalization;

public partial class Examples
{
    public async Task Example4() {
        var client = new SeedRequestParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.GetusernameAsync(
            new UserGetUsernameRequest {
                Limit = 1,
                Id = "id",
                Date = DateOnly.Parse("2023-01-15"),
                Deadline = DateTime.Parse("2024-01-15T09:30:00Z", null, DateTimeStyles.AdjustToUniversal),
                Bytes = "bytes",
                User = new User {
                    Name = "name",
                    Tags = new List<string>(){
                        "tags",
                        "tags",
                    }

                },
                UserList = new List<User>(){
                    new User {
                        Name = "name",
                        Tags = new List<string>(){
                            "tags",
                            "tags",
                        }

                    },
                }
                ,
                OptionalDeadline = DateTime.Parse("2024-01-15T09:30:00Z", null, DateTimeStyles.AdjustToUniversal),
                KeyValue = new Dictionary<string, string>(){
                    ["keyValue"] = "keyValue",
                }
                ,
                OptionalString = "optionalString",
                NestedUser = new NestedUser {
                    Name = "name",
                    User = new User {
                        Name = "name",
                        Tags = new List<string>(){
                            "tags",
                            "tags",
                        }

                    }
                },
                OptionalUser = new User {
                    Name = "name",
                    Tags = new List<string>(){
                        "tags",
                        "tags",
                    }

                },
                ExcludeUser = new List<User>(){
                    new User {
                        Name = "name",
                        Tags = new List<string>(){
                            "tags",
                            "tags",
                        }

                    },
                }
                ,
                Filter = new List<string>(){
                    "filter",
                }
                ,
                LongParam = 1000000L,
                BigIntParam = 1
            }
        );
    }

}

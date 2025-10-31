using SeedRequestParameters;
using System.Threading.Tasks;
using System.Globalization;

namespace Usage;

public class Example4
{
    public async Task Do() {
        var client = new SeedRequestParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.GetUsernameAsync(
            new GetUsersRequest {
                Limit = 1,
                Id = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                Date = DateOnly.Parse("2023-01-15"),
                Deadline = DateTime.Parse("2024-01-15T09:30:00Z", null, DateTimeStyles.AdjustToUniversal),
                Bytes = "SGVsbG8gd29ybGQh",
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
                BigIntParam = "1000000"
            }
        );
    }

}

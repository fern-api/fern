using global::Contoso.Net;

namespace Usage;

public class Example3
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new global::Contoso.Net.Contoso(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.System.CreateTaskAsync(
            new global::Contoso.Net.System.Task {
                Name = "name",
                User = new global::Contoso.Net.System.User {
                    Line1 = "line1",
                    Line2 = "line2",
                    City = "city",
                    State = "state",
                    Zip = "zip",
                    Country = "USA"
                },
                Owner = new global::Contoso.Net.System.User {
                    Line1 = "line1",
                    Line2 = "line2",
                    City = "city",
                    State = "state",
                    Zip = "zip",
                    Country = "USA"
                }
            }
        );
    }

}

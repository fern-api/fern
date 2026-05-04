using Contoso.Net;

public partial class Examples
{
    public async System.Threading.Tasks.Task Example6() {
        var client = new ContosoClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.System.CreateTaskAsync(
            new Contoso.Net.System.Task {
                Name = "name",
                User = new Contoso.Net.System.User {
                    Line1 = "line1",
                    Line2 = "line2",
                    City = "city",
                    State = "state",
                    Zip = "zip",
                    Country = "USA"
                },
                Owner = new Contoso.Net.System.User {
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

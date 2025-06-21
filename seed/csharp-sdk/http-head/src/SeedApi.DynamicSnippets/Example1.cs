using global::System.Threading.Tasks;
using SeedHttpHead;

namespace Usage;

public class Example1
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedHttpHeadClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.ListAsync(
            new ListUsersRequest{
                Limit = 1
            }
        );
    }

}

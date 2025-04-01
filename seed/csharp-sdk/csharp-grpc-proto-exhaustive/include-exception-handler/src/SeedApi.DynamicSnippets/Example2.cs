using global::System.Threading.Tasks;
using SeedApi;

namespace Usage;

public class Example2
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Dataservice.UploadAsync(
            new UploadRequest{
                Columns = new List<Column>(){
                    new Column{
                        Id = "id",
                        Values = new List<float>(){
                            1.1f,
                        }
                    },
                }
            }
        );
    }

}

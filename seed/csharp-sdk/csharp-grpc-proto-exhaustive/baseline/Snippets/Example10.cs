using SeedApi;

public partial class Examples
{
    public async Task Example10() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.DataService.UploadAsync(
            new UploadRequest {
                Columns = new List<Column>(){
                    new Column {
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

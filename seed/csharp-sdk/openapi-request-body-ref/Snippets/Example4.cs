using SeedApi;
using System.Text;

public partial class Examples
{
    public async Task Example4() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Catalog.CreateCatalogImageAsync(
            new CreateCatalogImageBody {
                ImageFile = new FileParameter(){
                    Stream = new MemoryStream(Encoding.UTF8.GetBytes("[bytes]"))
                },
                Request = new CreateCatalogImageRequest {
                    CatalogObjectId = "catalog_object_id"
                }
            }
        );
    }

}

using SeedApi;

public partial class Examples
{
    public async Task Example5() {
        var client = new SeedApiClient(
            token: "<token>"
        );

        await client.Files.UploadAsync(
            new FilesUploadRequest {
                Name = "name",
                ParentId = "parent_id"
            }
        );
    }

}

using SeedApi;

public partial class Examples
{
    public async Task Example3() {
        var client = new SeedPathParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Organizations.GetorganizationuserAsync(
            "tenant_id",
            "organization_id",
            "user_id",
            new OrganizationsGetOrganizationUserRequest()
        );
    }

}

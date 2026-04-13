using SeedApi;

public partial class Examples
{
    public async Task Example3() {
        var client = new SeedNullableOptionalClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Nullableoptional.UpdateuserAsync(
            new UpdateUserRequest {
                UserId = "userId",
                Username = "username",
                Email = "email",
                Phone = "phone",
                Address = new Address {
                    Street = "street",
                    City = "city",
                    State = "state",
                    ZipCode = "zipCode",
                    Country = "country",
                    BuildingId = "buildingId",
                    TenantId = "tenantId"
                }
            }
        );
    }

}

using SeedNullableOptional;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedNullableOptionalClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.NullableOptional.UpdateUserAsync(
            "userId",
            new UpdateUserRequest {
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

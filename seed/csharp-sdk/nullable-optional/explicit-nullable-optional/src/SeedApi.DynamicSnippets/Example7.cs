using SeedApi;

namespace Usage;

public class Example7
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Nullableoptional.CreateuserAsync(
            new CreateUserRequest {
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

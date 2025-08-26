using global::System.Threading.Tasks;
using SeedNullableOptional;

namespace Usage;

public class Example1
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedNullableOptionalClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.NullableOptional.CreateUserAsync(
            new CreateUserRequest{
                Username = "username",
                Email = "email",
                Phone = "phone",
                Address = new Address{
                    Street = "street",
                    City = "city",
                    State = "state",
                    ZipCode = "zipCode",
                    Country = "country"
                }
            }
        );
    }

}

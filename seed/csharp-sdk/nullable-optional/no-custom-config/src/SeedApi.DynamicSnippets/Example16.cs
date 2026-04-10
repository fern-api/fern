using SeedApi;

namespace Usage;

public class Example16
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Nullableoptional.TestdeserializationAsync(
            new DeserializationTestRequest {
                RequiredString = "requiredString",
                NullableEnum = UserRole.Admin,
                NullableUnion = new NotificationMethodZero {
                    EmailAddress = "emailAddress",
                    Subject = "subject",
                    Type = NotificationMethodZeroType.Email
                },
                NullableObject = new Address {
                    Street = "street",
                    ZipCode = "zipCode"
                }
            }
        );
    }

}

using SeedApi;
using System.Globalization;

namespace Usage;

public class Example17
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
                NullableString = "nullableString",
                OptionalString = "optionalString",
                OptionalNullableString = "optionalNullableString",
                NullableEnum = UserRole.Admin,
                OptionalEnum = UserStatus.Active,
                NullableUnion = new NotificationMethodZero {
                    Type = NotificationMethodZeroType.Email,
                    EmailAddress = "emailAddress",
                    Subject = "subject",
                    HtmlContent = "htmlContent"
                },
                OptionalUnion = new SearchResultZero {
                    Type = SearchResultZeroType.User,
                    Id = "id",
                    Username = "username",
                    Email = "email",
                    Phone = "phone",
                    CreatedAt = DateTime.Parse("2024-01-15T09:30:00Z", null, DateTimeStyles.AdjustToUniversal),
                    UpdatedAt = DateTime.Parse("2024-01-15T09:30:00Z", null, DateTimeStyles.AdjustToUniversal),
                    Address = new Address {
                        Street = "street",
                        City = "city",
                        State = "state",
                        ZipCode = "zipCode",
                        Country = "country",
                        BuildingId = "buildingId",
                        TenantId = "tenantId"
                    }
                },
                NullableList = new List<string>(){
                    "nullableList",
                    "nullableList",
                }
                ,
                NullableMap = new Dictionary<string, int?>(){
                    ["nullableMap"] = 1,
                }
                ,
                NullableObject = new Address {
                    Street = "street",
                    City = "city",
                    State = "state",
                    ZipCode = "zipCode",
                    Country = "country",
                    BuildingId = "buildingId",
                    TenantId = "tenantId"
                },
                OptionalObject = new Organization {
                    Id = "id",
                    Name = "name",
                    Domain = "domain",
                    EmployeeCount = 1
                }
            }
        );
    }

}

using SeedNullableOptional;
using System.Globalization;

namespace Usage;

public class Example7
{
    public async Task Do() {
        var client = new SeedNullableOptionalClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.NullableOptional.UpdateComplexProfileAsync(
            "profileId",
            new UpdateComplexProfileRequest {
                NullableRole = UserRole.Admin,
                NullableStatus = UserStatus.Active,
                NullableNotification = new NotificationMethod(
                    new EmailNotification {
                        EmailAddress = "emailAddress",
                        Subject = "subject",
                        HtmlContent = "htmlContent"
                    }
                ),
                NullableSearchResult = new SearchResult(
                    new UserResponse {
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
                    }
                ),
                NullableArray = new List<string>(){
                    "nullableArray",
                    "nullableArray",
                }

            }
        );
    }

}

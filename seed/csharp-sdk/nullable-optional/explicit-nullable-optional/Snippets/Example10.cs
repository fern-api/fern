using SeedApi;
using System.Globalization;

public partial class Examples
{
    public async Task Example10() {
        var client = new SeedNullableOptionalClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Nullableoptional.CreatecomplexprofileAsync(
            new ComplexProfile {
                Id = "id",
                NullableRole = UserRole.Admin,
                NullableStatus = UserStatus.Active,
                NullableNotification = new NotificationMethodZero {
                    EmailAddress = "emailAddress",
                    Subject = "subject",
                    Type = NotificationMethodZeroType.Email
                },
                NullableSearchResult = new SearchResultZero {
                    Id = "id",
                    Username = "username",
                    CreatedAt = DateTime.Parse("2024-01-15T09:30:00Z", null, DateTimeStyles.AdjustToUniversal),
                    Type = SearchResultZeroType.User
                }
            }
        );
    }

}

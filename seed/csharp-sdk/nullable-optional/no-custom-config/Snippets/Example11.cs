using SeedApi;
using System.Globalization;
using OneOf;

public partial class Examples
{
    public async Task Example11() {
        var client = new SeedNullableOptionalClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Nullableoptional.CreatecomplexprofileAsync(
            new ComplexProfile {
                Id = "id",
                NullableRole = UserRole.Admin,
                OptionalRole = UserRole.Admin,
                OptionalNullableRole = UserRole.Admin,
                NullableStatus = UserStatus.Active,
                OptionalStatus = UserStatus.Active,
                OptionalNullableStatus = UserStatus.Active,
                NullableNotification = new NotificationMethodZero {
                    Type = NotificationMethodZeroType.Email,
                    EmailAddress = "emailAddress",
                    Subject = "subject",
                    HtmlContent = "htmlContent"
                },
                OptionalNotification = new NotificationMethodZero {
                    Type = NotificationMethodZeroType.Email,
                    EmailAddress = "emailAddress",
                    Subject = "subject",
                    HtmlContent = "htmlContent"
                },
                OptionalNullableNotification = new NotificationMethodZero {
                    Type = NotificationMethodZeroType.Email,
                    EmailAddress = "emailAddress",
                    Subject = "subject",
                    HtmlContent = "htmlContent"
                },
                NullableSearchResult = new SearchResultZero {
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
                OptionalSearchResult = new SearchResultZero {
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
                NullableArray = new List<string>(){
                    "nullableArray",
                    "nullableArray",
                }
                ,
                OptionalArray = new List<string>(){
                    "optionalArray",
                    "optionalArray",
                }
                ,
                OptionalNullableArray = new List<string>(){
                    "optionalNullableArray",
                    "optionalNullableArray",
                }
                ,
                NullableListOfNullables = new List<string>(){
                    "nullableListOfNullables",
                    "nullableListOfNullables",
                }
                ,
                NullableMapOfNullables = new Dictionary<string, Address?>(){
                    ["nullableMapOfNullables"] = new Address {
                        Street = "street",
                        City = "city",
                        State = "state",
                        ZipCode = "zipCode",
                        Country = "country",
                        BuildingId = "buildingId",
                        TenantId = "tenantId"
                    },
                }
                ,
                NullableListOfUnions = new List<OneOf<NotificationMethodZero, NotificationMethodOne, NotificationMethodTwo>>(){
                    new NotificationMethodZero {
                        Type = NotificationMethodZeroType.Email,
                        EmailAddress = "emailAddress",
                        Subject = "subject",
                        HtmlContent = "htmlContent"
                    },
                    new NotificationMethodZero {
                        Type = NotificationMethodZeroType.Email,
                        EmailAddress = "emailAddress",
                        Subject = "subject",
                        HtmlContent = "htmlContent"
                    },
                }
                ,
                OptionalMapOfEnums = new Dictionary<string, UserRole?>(){
                    ["optionalMapOfEnums"] = UserRole.Admin,
                }

            }
        );
    }

}

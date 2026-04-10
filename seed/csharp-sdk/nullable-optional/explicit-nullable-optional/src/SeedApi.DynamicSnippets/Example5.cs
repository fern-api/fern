using SeedNullableOptional;
using System.Globalization;

namespace Usage;

public class Example5
{
    public async Task Do() {
        var client = new SeedNullableOptionalClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.NullableOptional.CreateComplexProfileAsync(
            new ComplexProfile {
                Id = "id",
                NullableRole = UserRole.Admin,
                OptionalRole = UserRole.Admin,
                OptionalNullableRole = UserRole.Admin,
                NullableStatus = UserStatus.Active,
                OptionalStatus = UserStatus.Active,
                OptionalNullableStatus = UserStatus.Active,
                NullableNotification = new NotificationMethod(
                    new EmailNotification {
                        EmailAddress = "emailAddress",
                        Subject = "subject",
                        HtmlContent = "htmlContent"
                    }
                ),
                OptionalNotification = new NotificationMethod(
                    new EmailNotification {
                        EmailAddress = "emailAddress",
                        Subject = "subject",
                        HtmlContent = "htmlContent"
                    }
                ),
                OptionalNullableNotification = new NotificationMethod(
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
                OptionalSearchResult = new SearchResult(
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
                NullableListOfUnions = new List<NotificationMethod>(){
                    new NotificationMethod(
                        new EmailNotification {
                            EmailAddress = "emailAddress",
                            Subject = "subject",
                            HtmlContent = "htmlContent"
                        }
                    ),
                    new NotificationMethod(
                        new EmailNotification {
                            EmailAddress = "emailAddress",
                            Subject = "subject",
                            HtmlContent = "htmlContent"
                        }
                    ),
                }
                ,
                OptionalMapOfEnums = new Dictionary<string, UserRole>(){
                    ["optionalMapOfEnums"] = UserRole.Admin,
                }

            }
        );
    }

}

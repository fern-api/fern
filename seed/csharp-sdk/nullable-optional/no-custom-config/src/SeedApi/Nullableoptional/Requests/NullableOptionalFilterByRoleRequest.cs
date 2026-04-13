using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record NullableOptionalFilterByRoleRequest
{
    [JsonIgnore]
    public required UserRole Role { get; set; }

    [JsonIgnore]
    public UserStatus? Status { get; set; }

    [JsonIgnore]
    public UserRole? SecondaryRole { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}

using System.Text.Json.Serialization;
using SeedNullableOptional.Core;

namespace SeedNullableOptional;

[Serializable]
public record FilterByRoleRequest
{
    [JsonIgnore]
    public UserRole? Role { get; set; }

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

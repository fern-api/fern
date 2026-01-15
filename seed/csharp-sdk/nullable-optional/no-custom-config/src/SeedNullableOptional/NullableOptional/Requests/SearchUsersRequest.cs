using System.Text.Json.Serialization;
using SeedNullableOptional.Core;

namespace SeedNullableOptional;

[Serializable]
public record SearchUsersRequest
{
    [JsonIgnore]
    public required string Query { get; set; }

    [JsonIgnore]
    public string? Department { get; set; }

    [JsonIgnore]
    public string? Role { get; set; }

    [JsonIgnore]
    public bool? IsActive { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}

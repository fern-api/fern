using System.Text.Json.Serialization;
using SeedNullableOptional.Core;

namespace SeedNullableOptional;

[Serializable]
public record ListUsersRequest
{
    [JsonIgnore]
    public int? Limit { get; set; }

    [JsonIgnore]
    public int? Offset { get; set; }

    [JsonIgnore]
    public bool? IncludeDeleted { get; set; }

    [JsonIgnore]
    public string? SortBy { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}

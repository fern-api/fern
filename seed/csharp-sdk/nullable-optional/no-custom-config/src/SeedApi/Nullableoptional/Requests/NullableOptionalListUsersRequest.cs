using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record NullableOptionalListUsersRequest
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

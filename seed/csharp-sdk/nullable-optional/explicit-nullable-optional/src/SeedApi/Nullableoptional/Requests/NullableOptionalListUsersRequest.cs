using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record NullableOptionalListUsersRequest
{
    [JsonIgnore]
    public Optional<int?> Limit { get; set; }

    [JsonIgnore]
    public Optional<int?> Offset { get; set; }

    [JsonIgnore]
    public Optional<bool?> IncludeDeleted { get; set; }

    [JsonIgnore]
    public Optional<string?> SortBy { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}

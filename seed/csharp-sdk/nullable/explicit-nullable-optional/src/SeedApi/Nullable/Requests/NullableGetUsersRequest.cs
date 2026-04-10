using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record NullableGetUsersRequest
{
    [JsonIgnore]
    public IEnumerable<string?> Usernames { get; set; } = new List<string?>();

    [JsonIgnore]
    public Optional<string?> Avatar { get; set; }

    [JsonIgnore]
    public IEnumerable<bool?> Activated { get; set; } = new List<bool?>();

    [JsonIgnore]
    public IEnumerable<string?> Tags { get; set; } = new List<string?>();

    [JsonIgnore]
    public Optional<bool?> Extra { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}

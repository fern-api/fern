using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record ServiceGetMetadataRequest
{
    [JsonIgnore]
    public bool? Shallow { get; set; }

    [JsonIgnore]
    public IEnumerable<string?> Tag { get; set; } = new List<string?>();

    [JsonIgnore]
    public required string ApiVersion { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}

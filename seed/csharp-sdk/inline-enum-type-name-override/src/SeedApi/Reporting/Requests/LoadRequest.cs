using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record LoadRequest
{
    [JsonPropertyName("cache")]
    public LoadRequestCache? Cache { get; set; }

    [JsonPropertyName("status")]
    public LoadRequestStatus? Status { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}

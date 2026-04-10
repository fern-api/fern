using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record HeadersSendRequest
{
    [JsonIgnore]
    public required HeadersSendRequestXEndpointVersion EndpointVersion { get; set; }

    [JsonIgnore]
    public required bool Async { get; set; }

    [JsonPropertyName("query")]
    public required string Query { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}

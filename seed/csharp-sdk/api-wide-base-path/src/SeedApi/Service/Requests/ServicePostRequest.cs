using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record ServicePostRequest
{
    [JsonIgnore]
    public required string PathParam { get; set; }

    [JsonIgnore]
    public required string ServiceParam { get; set; }

    [JsonIgnore]
    public required int EndpointParam { get; set; }

    [JsonIgnore]
    public required string ResourceParam { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}

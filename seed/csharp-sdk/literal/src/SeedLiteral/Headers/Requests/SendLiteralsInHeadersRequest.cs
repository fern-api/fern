using System.Text.Json;
using System.Text.Json.Serialization;
using SeedLiteral.Core;

namespace SeedLiteral;

public record SendLiteralsInHeadersRequest
{
    [JsonIgnore]
    public string EndpointVersion { get; set; } = "02-12-2024";

    [JsonIgnore]
    public bool Async { get; set; } = true;

    [JsonPropertyName("query")]
    public required string Query { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}

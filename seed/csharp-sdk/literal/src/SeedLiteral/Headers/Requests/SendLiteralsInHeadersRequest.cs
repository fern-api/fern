using System.Text.Json.Serialization;
using SeedLiteral.Core;

namespace SeedLiteral;

[Serializable]
public record SendLiteralsInHeadersRequest
{
    [JsonIgnore]
    public string EndpointVersion { get; set; } = "02-12-2024";

    [JsonIgnore]
    public bool Async { get; set; } = true;

    [JsonPropertyName("query")]
    public required string Query { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}

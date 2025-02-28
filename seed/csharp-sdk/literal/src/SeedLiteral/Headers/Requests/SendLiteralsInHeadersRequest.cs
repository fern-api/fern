using System.Text.Json.Serialization;
using SeedLiteral.Core;

namespace SeedLiteral;

public record SendLiteralsInHeadersRequest
{
    [JsonIgnore]
    public string EndpointVersion { get; set; } = "02-12-2024";

    [JsonIgnore]
    public bool Async { get; set; } = true;

    public required string Query { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}

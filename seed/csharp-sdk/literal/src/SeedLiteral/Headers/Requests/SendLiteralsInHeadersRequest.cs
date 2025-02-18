using SeedLiteral.Core;

namespace SeedLiteral;

public record SendLiteralsInHeadersRequest
{
    public string EndpointVersion { get; set; } = "02-12-2024";

    public bool Async { get; set; } = true;

    public required string Query { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}

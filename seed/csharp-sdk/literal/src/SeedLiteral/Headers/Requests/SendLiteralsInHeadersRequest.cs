using SeedLiteral.Core;

namespace SeedLiteral;

public record SendLiteralsInHeadersRequest
{
    public required string EndpointVersion { get; set; }

    public required bool Async { get; set; }

    public required string Query { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}

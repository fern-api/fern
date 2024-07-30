namespace SeedLiteral;

public record SendLiteralsInHeadersRequest
{
    public required string EndpointVersion { get; }

    public required bool Async { get; }

    public required string Query { get; }
}

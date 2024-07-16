namespace SeedLiteral;

public record SendLiteralsInHeadersRequest
{
    public required string EndpointVersion { get; init; }

    public required bool Async { get; init; }

    public required string Query { get; init; }
}

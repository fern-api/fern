namespace SeedLiteral;

public record SendLiteralsInQueryRequest
{
    public required string Prompt { get; init; }

    public required string Query { get; init; }

    public required bool Stream { get; init; }
}

namespace SeedLiteral;

public record SendLiteralsInQueryRequest
{
    public required string Prompt { get; }

    public required string Query { get; }

    public required bool Stream { get; }
}

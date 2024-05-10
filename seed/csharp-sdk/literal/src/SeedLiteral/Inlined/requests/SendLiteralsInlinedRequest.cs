namespace SeedLiteral;

public class SendLiteralsInlinedRequest
{
    public string Prompt { get; init; }

    public string Query { get; init; }

    public double? Temperature { get; init; }

    public bool Stream { get; init; }
}

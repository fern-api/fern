namespace SeedLiteral;

public class SendLiteralsInQueryRequest
{
    public List<string> Prompt { get; init; }

    public string Query { get; init; }

    public List<bool> Stream { get; init; }
}

namespace SeedExamples;

public class GetMetadataRequest
{
    public List<bool?> Shallow { get; init; }

    public List<string?> Tag { get; init; }

    public string XApiVersion { get; init; }
}

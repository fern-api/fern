namespace SeedExamples;

public record GetMetadataRequest
{
    public bool? Shallow { get; }

    public string? Tag { get; }

    public required string XApiVersion { get; }
}

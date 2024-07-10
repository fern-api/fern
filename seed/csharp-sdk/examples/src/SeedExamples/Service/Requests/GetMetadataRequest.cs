namespace SeedExamples;

public record GetMetadataRequest
{
    public bool? Shallow { get; init; }

    public string? Tag { get; init; }

    public required string XApiVersion { get; init; }
}

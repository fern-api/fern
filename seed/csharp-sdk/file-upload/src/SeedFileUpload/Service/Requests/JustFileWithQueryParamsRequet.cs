namespace SeedFileUpload;

public record JustFileWithQueryParamsRequet
{
    public string? MaybeString { get; init; }

    public required int Integer { get; init; }

    public int? MaybeInteger { get; init; }

    public required string ListOfStrings { get; init; }

    public string? OptionalListOfStrings { get; init; }
}

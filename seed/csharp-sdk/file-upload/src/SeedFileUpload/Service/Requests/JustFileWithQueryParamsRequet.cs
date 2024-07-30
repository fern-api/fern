namespace SeedFileUpload;

public record JustFileWithQueryParamsRequet
{
    public string? MaybeString { get; }

    public required int Integer { get; }

    public int? MaybeInteger { get; }

    public required string ListOfStrings { get; }

    public string? OptionalListOfStrings { get; }
}

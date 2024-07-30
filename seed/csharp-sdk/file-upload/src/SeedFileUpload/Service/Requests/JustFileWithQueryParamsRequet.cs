namespace SeedFileUpload;

public record JustFileWithQueryParamsRequet
{
    public string? MaybeString { get; set; }

    public required int Integer { get; set; }

    public int? MaybeInteger { get; set; }

    public required string ListOfStrings { get; set; }

    public string? OptionalListOfStrings { get; set; }
}

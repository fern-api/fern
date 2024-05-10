namespace SeedFileUpload;

public class JustFileWithQueryParamsRequet
{
    public List<string?> MaybeString { get; init; }

    public int Integer { get; init; }

    public List<int?> MaybeInteger { get; init; }

    public string ListOfStrings { get; init; }

    public List<string?> OptionalListOfStrings { get; init; }
}

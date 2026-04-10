using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record ServiceWithFormEncodedContainersRequest
{
    public string? MaybeString { get; set; }

    public int? Integer { get; set; }

    public FileParameter? File { get; set; }

    public FileParameter? FileList { get; set; }

    public FileParameter? MaybeFile { get; set; }

    public FileParameter? MaybeFileList { get; set; }

    public int? MaybeInteger { get; set; }

    public IEnumerable<string>? OptionalListOfStrings { get; set; }

    public IEnumerable<MyObject>? ListOfObjects { get; set; }

    public object? OptionalMetadata { get; set; }

    public ObjectType? OptionalObjectType { get; set; }

    public string? OptionalId { get; set; }

    public IEnumerable<MyObjectWithOptional>? ListOfObjectsWithOptionals { get; set; }

    public MyObject? AliasObject { get; set; }

    public IEnumerable<MyObject>? ListOfAliasObject { get; set; }

    public IEnumerable<MyObject>? AliasListOfObject { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}

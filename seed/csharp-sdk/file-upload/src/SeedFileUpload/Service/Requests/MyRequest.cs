using SeedFileUpload.Core;

namespace SeedFileUpload;

[Serializable]
public record MyRequest
{
    public string? MaybeString { get; set; }

    public required int Integer { get; set; }

    public required FileParameter File { get; set; }

    public required FileParameter FileList { get; set; }

    public FileParameter? MaybeFile { get; set; }

    public FileParameter? MaybeFileList { get; set; }

    public int? MaybeInteger { get; set; }

    public IEnumerable<string>? OptionalListOfStrings { get; set; }

    public IEnumerable<MyObject> ListOfObjects { get; set; } = new List<MyObject>();

    public object? OptionalMetadata { get; set; }

    public ObjectType? OptionalObjectType { get; set; }

    public string? OptionalId { get; set; }

    public required MyObject AliasObject { get; set; }

    public IEnumerable<MyObject> ListOfAliasObject { get; set; } = new List<MyObject>();

    public IEnumerable<MyObject> AliasListOfObject { get; set; } = new List<MyObject>();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}

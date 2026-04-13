using SeedFileUpload.Core;

namespace SeedFileUpload;

[Serializable]
public record MyOtherRequest
{
    public string? MaybeString { get; set; }

    public required int Integer { get; set; }

    public required FileParameter File { get; set; }

    public IEnumerable<FileParameter> FileList { get; set; } = new List<FileParameter>();

    public FileParameter? MaybeFile { get; set; }

    public IEnumerable<FileParameter>? MaybeFileList { get; set; }

    public int? MaybeInteger { get; set; }

    public IEnumerable<string>? OptionalListOfStrings { get; set; }

    public IEnumerable<MyObject> ListOfObjects { get; set; } = new List<MyObject>();

    public object? OptionalMetadata { get; set; }

    public ObjectType? OptionalObjectType { get; set; }

    public string? OptionalId { get; set; }

    public IEnumerable<MyObjectWithOptional> ListOfObjectsWithOptionals { get; set; } =
        new List<MyObjectWithOptional>();

    public required MyObject AliasObject { get; set; }

    public IEnumerable<MyObject> ListOfAliasObject { get; set; } = new List<MyObject>();

    public IEnumerable<MyObject> AliasListOfObject { get; set; } = new List<MyObject>();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}

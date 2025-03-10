using SeedFileUpload.Core;

namespace SeedFileUpload;

public record MyRequest
{
    public string? MaybeString { get; set; }
    public int Integer { get; set; }
    public required FileParameter File { get; set; }
    public IEnumerable<FileParameter> FileList { get; set; } = [];
    public FileParameter? MaybeFile { get; set; }
    public IEnumerable<FileParameter>? MaybeFileList { get; set; }
    public int? MaybeInteger { get; set; }
    public IEnumerable<string>? OptionalListOfStrings { get; set; }
    public IEnumerable<MyObject> ListOfObjects { get; set; } = [];
    public object? OptionalMetadata { get; set; }
    public ObjectType? OptionalObjectType { get; set; }
    public string? OptionalId { get; set; }
    public IEnumerable<MyObjectWithOptional> ListOfObjectsWithOptionals { get; set; } = [];
    public required MyObject AliasObject { get; set; }
    public IEnumerable<MyObject> ListOfAliasObject { get; set; } = [];
    public required IEnumerable<MyObject> AliasListOfObject { get; set; }
    
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}

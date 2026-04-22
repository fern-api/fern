using SeedFileUpload.Core;

namespace SeedFileUpload;

[Serializable]
public record OptionalArgsRequest
{
    public FileParameter? ImageFile { get; set; }

    public object? Request { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}

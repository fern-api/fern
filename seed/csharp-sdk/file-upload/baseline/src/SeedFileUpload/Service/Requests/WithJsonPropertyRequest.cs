using SeedFileUpload.Core;

namespace SeedFileUpload;

[Serializable]
public record WithJsonPropertyRequest
{
    public required FileParameter File { get; set; }

    public MyObject? Json { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}

using SeedFileUpload.Core;

namespace SeedFileUpload;

[Serializable]
public record LiteralEnumRequest
{
    public required FileParameter File { get; set; }

    public string? ModelType { get; set; }

    public OpenEnumType? OpenEnum { get; set; }

    public string? MaybeName { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}

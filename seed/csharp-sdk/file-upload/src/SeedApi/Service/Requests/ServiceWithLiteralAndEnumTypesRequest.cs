using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record ServiceWithLiteralAndEnumTypesRequest
{
    public FileParameter? File { get; set; }

    public ModelType? ModelType { get; set; }

    public OpenEnumType? OpenEnum { get; set; }

    public string? MaybeName { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}

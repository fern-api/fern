using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record ServiceWithJsonPropertyRequest
{
    public FileParameter? File { get; set; }

    public MyObject? Json { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}

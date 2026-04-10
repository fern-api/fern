using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record MultipartFormMultipartFormRequest
{
    public Color? Color { get; set; }

    public Color? MaybeColor { get; set; }

    public IEnumerable<Color>? ColorList { get; set; }

    public IEnumerable<Color>? MaybeColorList { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}

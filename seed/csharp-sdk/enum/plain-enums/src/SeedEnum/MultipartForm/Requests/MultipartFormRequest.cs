using SeedEnum.Core;

namespace SeedEnum;

[Serializable]
public record MultipartFormRequest
{
    public required Color Color { get; set; }

    public Color? MaybeColor { get; set; }

    public IEnumerable<Color> ColorList { get; set; } = new List<Color>();

    public IEnumerable<Color>? MaybeColorList { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}

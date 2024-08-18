using OneOf;

#nullable enable

namespace SeedApi;

public class MetadataValue(
    OneOf<
        string,
        double,
        bool,
        IEnumerable<MetadataValue?>,
        Dictionary<string, MetadataValue?>
    > value
)
    : OneOfBase<
        string,
        double,
        bool,
        IEnumerable<MetadataValue?>,
        Dictionary<string, MetadataValue?>
    >(value)
{
    public static implicit operator MetadataValue(string value) => new(value);

    public static implicit operator MetadataValue(bool value) => new(value);

    public static implicit operator MetadataValue(double value) => new(value);

    public static implicit operator MetadataValue(Dictionary<string, MetadataValue?> value) =>
        new(value);

    public static implicit operator MetadataValue(MetadataValue?[] value) => new(value);

    public static implicit operator MetadataValue(List<MetadataValue?> value) => new(value);

    public static implicit operator MetadataValue(string[] value) =>
        new(value.Select(v => v != null ? new MetadataValue(v) : null).ToList());

    public static implicit operator MetadataValue(double[] value) =>
        new(value.Select(v => new MetadataValue(v)).ToList());

    public static implicit operator MetadataValue(double?[] value) =>
        new(value.Select(v => v != null ? new MetadataValue(v.Value) : null).ToList());

    public static implicit operator MetadataValue(bool[] value) =>
        new(value.Select(v => new MetadataValue(v)).ToList());

    public static implicit operator MetadataValue(bool?[] value) =>
        new(value.Select(v => v != null ? new MetadataValue(v.Value) : null).ToList());

    public static implicit operator MetadataValue(List<string> value) =>
        new(value.Select(v => new MetadataValue(v)).ToList());

    public static implicit operator MetadataValue(List<double> value) =>
        new(value.Select(v => new MetadataValue(v)).ToList());

    public static implicit operator MetadataValue(List<double?> value) =>
        new(value.Select(v => v != null ? new MetadataValue(v.Value) : null).ToList());

    public static implicit operator MetadataValue(List<bool> value) =>
        new(value.Select(v => new MetadataValue(v)).ToList());

    public static implicit operator MetadataValue(List<bool?> value) =>
        new(value.Select(v => v != null ? new MetadataValue(v.Value) : null).ToList());
}

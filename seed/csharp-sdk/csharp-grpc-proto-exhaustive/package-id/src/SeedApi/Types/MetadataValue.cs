using OneOf;
using SeedApi.Core;
using WellKnownProto = Google.Protobuf.WellKnownTypes;

namespace SeedApi;

public sealed class MetadataValue(
    OneOf<string, double, bool, IEnumerable<MetadataValue?>, Metadata> value
) : OneOfBase<string, double, bool, IEnumerable<MetadataValue?>, Metadata>(value)
{
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    internal WellKnownProto.Value ToProto()
    {
        return Match<WellKnownProto.Value>(
            WellKnownProto.Value.ForString,
            WellKnownProto.Value.ForNumber,
            WellKnownProto.Value.ForBool,
            list => new WellKnownProto.Value
            {
                ListValue = new WellKnownProto.ListValue
                {
                    Values = { list.Select(item => item?.ToProto()) },
                },
            },
            nested => new WellKnownProto.Value { StructValue = nested.ToProto() }
        );
    }

    internal static MetadataValue? FromProto(WellKnownProto.Value value)
    {
        return value.KindCase switch
        {
            WellKnownProto.Value.KindOneofCase.StringValue => value.StringValue,
            WellKnownProto.Value.KindOneofCase.NumberValue => value.NumberValue,
            WellKnownProto.Value.KindOneofCase.BoolValue => value.BoolValue,
            WellKnownProto.Value.KindOneofCase.ListValue => value
                .ListValue.Values.Select(FromProto)
                .ToList(),
            WellKnownProto.Value.KindOneofCase.StructValue => Metadata.FromProto(value.StructValue),
            _ => null,
        };
    }

    public static implicit operator MetadataValue(string value) => new(value);

    public static implicit operator MetadataValue(bool value) => new(value);

    public static implicit operator MetadataValue(double value) => new(value);

    public static implicit operator MetadataValue(Metadata value) => new(value);

    public static implicit operator MetadataValue(MetadataValue?[] value) => new(value);

    public static implicit operator MetadataValue(List<MetadataValue?> value) => new(value);

    public static implicit operator MetadataValue(string[] value) =>
        new(value.Select(v => new MetadataValue(v)).ToList());

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

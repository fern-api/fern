using OneOf;
using SeedApi.Core;
using Proto = Google.Protobuf.WellKnownTypes;

#nullable enable

namespace SeedApi;

public sealed class MetadataValue(
    OneOf<string, double, bool, IEnumerable<MetadataValue?>, Metadata> value
) : OneOfBase<string, double, bool, IEnumerable<MetadataValue?>, Metadata>(value)
{
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    internal Proto.Value ToProto()
    {
        return Match<Proto.Value>(
            Proto.Value.ForString,
            Proto.Value.ForNumber,
            Proto.Value.ForBool,
            list => new Proto.Value
            {
                ListValue = new Proto.ListValue
                {
                    Values = { list.Select(item => item?.ToProto()) },
                },
            },
            nested => new Proto.Value { StructValue = nested.ToProto() }
        );
    }

    internal static MetadataValue? FromProto(Proto.Value value)
    {
        return value.KindCase switch
        {
            Proto.Value.KindOneofCase.StringValue => value.StringValue,
            Proto.Value.KindOneofCase.NumberValue => value.NumberValue,
            Proto.Value.KindOneofCase.BoolValue => value.BoolValue,
            Proto.Value.KindOneofCase.ListValue => value
                .ListValue.Values.Select(FromProto)
                .ToList(),
            Proto.Value.KindOneofCase.StructValue => Metadata.FromProto(value.StructValue),
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

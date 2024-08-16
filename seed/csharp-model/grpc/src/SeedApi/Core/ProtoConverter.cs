using Google.Protobuf.WellKnownTypes;

#nullable enable

namespace SeedApi;

/// <summary>
/// Utility class for converting to and from Protobuf types.
/// </summary>
internal class ProtoConverter
{
    public static Struct ToProtoStruct(Dictionary<string, MetadataValue?> value)
    {
        var result = new Struct();
        foreach (var kvp in value)
        {
            result.Fields[kvp.Key] = ToProtoValue(kvp.Value);
        }
        return result;
    }

    public static Dictionary<string, MetadataValue?> FromProtoStruct(Struct value)
    {
        var result = new Dictionary<string, MetadataValue?>();
        foreach (var kvp in value.Fields)
        {
            result[kvp.Key] = FromProtoValue(kvp.Value);
        }
        return result;
    }

    public static Value ToProtoValue(MetadataValue? value)
    {
        if (value == null)
        {
            Value.ForNull();
        }
        return value.Match<Value>(
            Value.ForString,
            Value.ForNumber,
            Value.ForBool,
            list => new Value
            {
                ListValue = new ListValue { Values = { list.Select(ToProtoValue) } }
            },
            nested => new Value { StructValue = ToProtoStruct(nested) }
        );
    }

    public static MetadataValue? FromProtoValue(Value value)
    {
        return value.KindCase switch
        {
            Value.KindOneofCase.StringValue => new MetadataValue(value.StringValue),
            Value.KindOneofCase.NumberValue => new MetadataValue(value.NumberValue),
            Value.KindOneofCase.BoolValue => new MetadataValue(value.BoolValue),
            Value.KindOneofCase.ListValue
                => new MetadataValue(value.ListValue.Values.Select(FromProtoValue).ToList()),
            Value.KindOneofCase.StructValue
                => new MetadataValue(FromProtoStruct(value.StructValue)),
            _ => null,
        };
    }
}

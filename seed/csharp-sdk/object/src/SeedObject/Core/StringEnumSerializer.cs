using System.Runtime.Serialization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SeedObject.Core;

public class StringEnumSerializer<TEnum> : JsonConverter<TEnum>
    where TEnum : struct, System.Enum
{
    private readonly Dictionary<TEnum, string> _enumToString = new Dictionary<TEnum, string>();
    private readonly Dictionary<string, TEnum> _stringToEnum = new Dictionary<string, TEnum>();

    public StringEnumSerializer()
    {
        var type = typeof(TEnum);
        var values = System.Enum.GetValues<TEnum>();

        foreach (var value in values)
        {
            var enumMember = type.GetMember(value.ToString())[0];
            var attr = enumMember
                .GetCustomAttributes(typeof(EnumMemberAttribute), false)
                .Cast<EnumMemberAttribute>()
                .FirstOrDefault();

            var stringValue = attr?.Value ?? value.ToString();

            _enumToString.Add(value, stringValue);
            _stringToEnum.Add(stringValue, value);
        }
    }

    public override TEnum Read(
        ref Utf8JsonReader reader,
        Type typeToConvert,
        JsonSerializerOptions options
    )
    {
        var stringValue = reader.GetString();

        if (_stringToEnum.TryGetValue(stringValue, out var enumValue))
        {
            return enumValue;
        }

        return default;
    }

    public override void Write(Utf8JsonWriter writer, TEnum value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(_enumToString[value]);
    }
}

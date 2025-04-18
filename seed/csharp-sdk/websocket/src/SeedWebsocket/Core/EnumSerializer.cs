using System.Runtime.Serialization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SeedWebsocket.Core;

internal class EnumSerializer<TEnum> : JsonConverter<TEnum>
    where TEnum : struct, Enum
{
    private readonly Dictionary<TEnum, string> _enumToString = new();
    private readonly Dictionary<string, TEnum> _stringToEnum = new();

    public EnumSerializer()
    {
        var type = typeof(TEnum);
        var values = Enum.GetValues(type);

        foreach (var value in values)
        {
            var enumValue = (TEnum)value;
            var enumMember = type.GetField(enumValue.ToString())!;
            var attr = enumMember
                .GetCustomAttributes(typeof(EnumMemberAttribute), false)
                .Cast<EnumMemberAttribute>()
                .FirstOrDefault();

            var stringValue =
                attr?.Value
                ?? value.ToString()
                ?? throw new Exception("Unexpected null enum toString value");

            _enumToString.Add(enumValue, stringValue);
            _stringToEnum.Add(stringValue, enumValue);
        }
    }

    public override TEnum Read(
        ref Utf8JsonReader reader,
        global::System.Type typeToConvert,
        JsonSerializerOptions options
    )
    {
        var stringValue =
            reader.GetString()
            ?? throw new Exception("The JSON value could not be read as a string.");
        return _stringToEnum.TryGetValue(stringValue, out var enumValue) ? enumValue : default;
    }

    public override void Write(Utf8JsonWriter writer, TEnum value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(_enumToString[value]);
    }
}

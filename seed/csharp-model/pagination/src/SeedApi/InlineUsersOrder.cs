using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(InlineUsersOrder.InlineUsersOrderSerializer))]
[Serializable]
public readonly record struct InlineUsersOrder : IStringEnum
{
    public static readonly InlineUsersOrder Asc = new(Values.Asc);

    public static readonly InlineUsersOrder Desc = new(Values.Desc);

    public InlineUsersOrder(string value)
    {
        Value = value;
    }

    /// <summary>
    /// The string value of the enum.
    /// </summary>
    public string Value { get; }

    /// <summary>
    /// Create a string enum with the given value.
    /// </summary>
    public static InlineUsersOrder FromCustom(string value)
    {
        return new InlineUsersOrder(value);
    }

    public bool Equals(string? other)
    {
        return Value.Equals(other);
    }

    /// <summary>
    /// Returns the string value of the enum.
    /// </summary>
    public override string ToString()
    {
        return Value;
    }

    public static bool operator ==(InlineUsersOrder value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(InlineUsersOrder value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(InlineUsersOrder value) => value.Value;

    public static explicit operator InlineUsersOrder(string value) => new(value);

    internal class InlineUsersOrderSerializer : JsonConverter<InlineUsersOrder>
    {
        public override InlineUsersOrder Read(
            ref Utf8JsonReader reader,
            Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new global::System.Exception(
                    "The JSON value could not be read as a string."
                );
            return new InlineUsersOrder(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            InlineUsersOrder value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override InlineUsersOrder ReadAsPropertyName(
            ref Utf8JsonReader reader,
            Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new global::System.Exception(
                    "The JSON property name could not be read as a string."
                );
            return new InlineUsersOrder(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            InlineUsersOrder value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Value);
        }
    }

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [Serializable]
    public static class Values
    {
        public const string Asc = "asc";

        public const string Desc = "desc";
    }
}

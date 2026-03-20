using System.Text.Json;
using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination.InlineUsers;

[JsonConverter(typeof(Order.OrderSerializer))]
[Serializable]
public readonly record struct Order : IStringEnum
{
    public static readonly Order Asc = new(Values.Asc);

    public static readonly Order Desc = new(Values.Desc);

    public Order(string value)
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
    public static Order FromCustom(string value)
    {
        return new Order(value);
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

    public static bool operator ==(Order value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(Order value1, string value2) => !value1.Value.Equals(value2);

    public static explicit operator string(Order value) => value.Value;

    public static explicit operator Order(string value) => new(value);

    internal class OrderSerializer : JsonConverter<Order>
    {
        public override Order Read(
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
            return new Order(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            Order value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override Order ReadAsPropertyName(
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
            return new Order(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            Order value,
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

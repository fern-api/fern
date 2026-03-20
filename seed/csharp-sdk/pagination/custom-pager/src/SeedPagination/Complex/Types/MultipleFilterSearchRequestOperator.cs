using System.Text.Json;
using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

[JsonConverter(
    typeof(MultipleFilterSearchRequestOperator.MultipleFilterSearchRequestOperatorSerializer)
)]
[Serializable]
public readonly record struct MultipleFilterSearchRequestOperator : IStringEnum
{
    public static readonly MultipleFilterSearchRequestOperator And = new(Values.And);

    public static readonly MultipleFilterSearchRequestOperator Or = new(Values.Or);

    public MultipleFilterSearchRequestOperator(string value)
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
    public static MultipleFilterSearchRequestOperator FromCustom(string value)
    {
        return new MultipleFilterSearchRequestOperator(value);
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

    public static bool operator ==(MultipleFilterSearchRequestOperator value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(MultipleFilterSearchRequestOperator value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(MultipleFilterSearchRequestOperator value) =>
        value.Value;

    public static explicit operator MultipleFilterSearchRequestOperator(string value) => new(value);

    internal class MultipleFilterSearchRequestOperatorSerializer
        : JsonConverter<MultipleFilterSearchRequestOperator>
    {
        public override MultipleFilterSearchRequestOperator Read(
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
            return new MultipleFilterSearchRequestOperator(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            MultipleFilterSearchRequestOperator value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override MultipleFilterSearchRequestOperator ReadAsPropertyName(
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
            return new MultipleFilterSearchRequestOperator(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            MultipleFilterSearchRequestOperator value,
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
        public const string And = "AND";

        public const string Or = "OR";
    }
}

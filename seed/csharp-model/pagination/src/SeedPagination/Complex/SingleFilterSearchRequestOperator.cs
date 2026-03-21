using System.Text.Json;
using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

[JsonConverter(
    typeof(SingleFilterSearchRequestOperator.SingleFilterSearchRequestOperatorSerializer)
)]
[Serializable]
public readonly record struct SingleFilterSearchRequestOperator : IStringEnum
{
    public static readonly SingleFilterSearchRequestOperator Equals_ = new(Values.Equals_);

    public static readonly SingleFilterSearchRequestOperator NotEquals = new(Values.NotEquals);

    public static readonly SingleFilterSearchRequestOperator In = new(Values.In);

    public static readonly SingleFilterSearchRequestOperator NotIn = new(Values.NotIn);

    public static readonly SingleFilterSearchRequestOperator LessThan = new(Values.LessThan);

    public static readonly SingleFilterSearchRequestOperator GreaterThan = new(Values.GreaterThan);

    public static readonly SingleFilterSearchRequestOperator Contains = new(Values.Contains);

    public static readonly SingleFilterSearchRequestOperator DoesNotContain = new(
        Values.DoesNotContain
    );

    public static readonly SingleFilterSearchRequestOperator StartsWith = new(Values.StartsWith);

    public static readonly SingleFilterSearchRequestOperator EndsWith = new(Values.EndsWith);

    public SingleFilterSearchRequestOperator(string value)
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
    public static SingleFilterSearchRequestOperator FromCustom(string value)
    {
        return new SingleFilterSearchRequestOperator(value);
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

    public static bool operator ==(SingleFilterSearchRequestOperator value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(SingleFilterSearchRequestOperator value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(SingleFilterSearchRequestOperator value) => value.Value;

    public static explicit operator SingleFilterSearchRequestOperator(string value) => new(value);

    internal class SingleFilterSearchRequestOperatorSerializer
        : JsonConverter<SingleFilterSearchRequestOperator>
    {
        public override SingleFilterSearchRequestOperator Read(
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
            return new SingleFilterSearchRequestOperator(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            SingleFilterSearchRequestOperator value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override SingleFilterSearchRequestOperator ReadAsPropertyName(
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
            return new SingleFilterSearchRequestOperator(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            SingleFilterSearchRequestOperator value,
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
        public const string Equals_ = "=";

        public const string NotEquals = "!=";

        public const string In = "IN";

        public const string NotIn = "NIN";

        public const string LessThan = "<";

        public const string GreaterThan = ">";

        public const string Contains = "~";

        public const string DoesNotContain = "!~";

        public const string StartsWith = "^";

        public const string EndsWith = "$";
    }
}

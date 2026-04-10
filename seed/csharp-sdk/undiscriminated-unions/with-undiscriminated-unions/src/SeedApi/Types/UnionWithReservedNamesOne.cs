using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(UnionWithReservedNamesOne.UnionWithReservedNamesOneSerializer))]
[Serializable]
public readonly record struct UnionWithReservedNamesOne : IStringEnum
{
    public static readonly UnionWithReservedNamesOne Value = new(Values.Value);

    public UnionWithReservedNamesOne(string value)
    {
        Value_ = value;
    }

    /// <summary>
    /// The string value of the enum.
    /// </summary>
    string IStringEnum.Value => Value_;

    /// <summary>
    /// The string value of the enum.
    /// </summary>
    public string Value_ { get; }

    /// <summary>
    /// Create a string enum with the given value.
    /// </summary>
    public static UnionWithReservedNamesOne FromCustom(string value)
    {
        return new UnionWithReservedNamesOne(value);
    }

    public bool Equals(string? other)
    {
        return Value_.Equals(other);
    }

    /// <summary>
    /// Returns the string value of the enum.
    /// </summary>
    public override string ToString()
    {
        return Value_;
    }

    public static bool operator ==(UnionWithReservedNamesOne value1, string value2) =>
        value1.Value_.Equals(value2);

    public static bool operator !=(UnionWithReservedNamesOne value1, string value2) =>
        !value1.Value_.Equals(value2);

    public static explicit operator string(UnionWithReservedNamesOne value) => value.Value_;

    public static explicit operator UnionWithReservedNamesOne(string value) => new(value);

    internal class UnionWithReservedNamesOneSerializer : JsonConverter<UnionWithReservedNamesOne>
    {
        public override UnionWithReservedNamesOne Read(
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
            return new UnionWithReservedNamesOne(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithReservedNamesOne value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value_);
        }

        public override UnionWithReservedNamesOne ReadAsPropertyName(
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
            return new UnionWithReservedNamesOne(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UnionWithReservedNamesOne value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Value_);
        }
    }

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [Serializable]
    public static class Values
    {
        public const string Value = "value";
    }
}

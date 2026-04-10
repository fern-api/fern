using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(
    typeof(UnionWithDuplicativeDiscriminantsOneType.UnionWithDuplicativeDiscriminantsOneTypeSerializer)
)]
[Serializable]
public readonly record struct UnionWithDuplicativeDiscriminantsOneType : IStringEnum
{
    public static readonly UnionWithDuplicativeDiscriminantsOneType SecondItemType = new(
        Values.SecondItemType
    );

    public UnionWithDuplicativeDiscriminantsOneType(string value)
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
    public static UnionWithDuplicativeDiscriminantsOneType FromCustom(string value)
    {
        return new UnionWithDuplicativeDiscriminantsOneType(value);
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

    public static bool operator ==(
        UnionWithDuplicativeDiscriminantsOneType value1,
        string value2
    ) => value1.Value.Equals(value2);

    public static bool operator !=(
        UnionWithDuplicativeDiscriminantsOneType value1,
        string value2
    ) => !value1.Value.Equals(value2);

    public static explicit operator string(UnionWithDuplicativeDiscriminantsOneType value) =>
        value.Value;

    public static explicit operator UnionWithDuplicativeDiscriminantsOneType(string value) =>
        new(value);

    internal class UnionWithDuplicativeDiscriminantsOneTypeSerializer
        : JsonConverter<UnionWithDuplicativeDiscriminantsOneType>
    {
        public override UnionWithDuplicativeDiscriminantsOneType Read(
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
            return new UnionWithDuplicativeDiscriminantsOneType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithDuplicativeDiscriminantsOneType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override UnionWithDuplicativeDiscriminantsOneType ReadAsPropertyName(
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
            return new UnionWithDuplicativeDiscriminantsOneType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UnionWithDuplicativeDiscriminantsOneType value,
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
        public const string SecondItemType = "secondItemType";
    }
}

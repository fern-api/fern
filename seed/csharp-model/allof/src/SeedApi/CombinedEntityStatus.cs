using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(CombinedEntityStatus.CombinedEntityStatusSerializer))]
[Serializable]
public readonly record struct CombinedEntityStatus : IStringEnum
{
    public static readonly CombinedEntityStatus Active = new(Values.Active);

    public static readonly CombinedEntityStatus Archived = new(Values.Archived);

    public CombinedEntityStatus(string value)
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
    public static CombinedEntityStatus FromCustom(string value)
    {
        return new CombinedEntityStatus(value);
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

    public static bool operator ==(CombinedEntityStatus value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(CombinedEntityStatus value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(CombinedEntityStatus value) => value.Value;

    public static explicit operator CombinedEntityStatus(string value) => new(value);

    internal class CombinedEntityStatusSerializer : JsonConverter<CombinedEntityStatus>
    {
        public override CombinedEntityStatus Read(
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
            return new CombinedEntityStatus(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            CombinedEntityStatus value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override CombinedEntityStatus ReadAsPropertyName(
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
            return new CombinedEntityStatus(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            CombinedEntityStatus value,
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
        public const string Active = "active";

        public const string Archived = "archived";
    }
}

using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(VendorStatus.VendorStatusSerializer))]
[Serializable]
public readonly record struct VendorStatus : IStringEnum
{
    public static readonly VendorStatus Active = new(Values.Active);

    public static readonly VendorStatus Inactive = new(Values.Inactive);

    public VendorStatus(string value)
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
    public static VendorStatus FromCustom(string value)
    {
        return new VendorStatus(value);
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

    public static bool operator ==(VendorStatus value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(VendorStatus value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(VendorStatus value) => value.Value;

    public static explicit operator VendorStatus(string value) => new(value);

    internal class VendorStatusSerializer : JsonConverter<VendorStatus>
    {
        public override VendorStatus Read(
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
            return new VendorStatus(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            VendorStatus value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override VendorStatus ReadAsPropertyName(
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
            return new VendorStatus(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            VendorStatus value,
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
        public const string Active = "ACTIVE";

        public const string Inactive = "INACTIVE";
    }
}

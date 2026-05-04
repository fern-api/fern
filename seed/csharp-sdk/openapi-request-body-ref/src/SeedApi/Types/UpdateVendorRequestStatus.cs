using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(UpdateVendorRequestStatus.UpdateVendorRequestStatusSerializer))]
[Serializable]
public readonly record struct UpdateVendorRequestStatus : IStringEnum
{
    public static readonly UpdateVendorRequestStatus Active = new(Values.Active);

    public static readonly UpdateVendorRequestStatus Inactive = new(Values.Inactive);

    public UpdateVendorRequestStatus(string value)
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
    public static UpdateVendorRequestStatus FromCustom(string value)
    {
        return new UpdateVendorRequestStatus(value);
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

    public static bool operator ==(UpdateVendorRequestStatus value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(UpdateVendorRequestStatus value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(UpdateVendorRequestStatus value) => value.Value;

    public static explicit operator UpdateVendorRequestStatus(string value) => new(value);

    internal class UpdateVendorRequestStatusSerializer : JsonConverter<UpdateVendorRequestStatus>
    {
        public override UpdateVendorRequestStatus Read(
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
            return new UpdateVendorRequestStatus(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UpdateVendorRequestStatus value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override UpdateVendorRequestStatus ReadAsPropertyName(
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
            return new UpdateVendorRequestStatus(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UpdateVendorRequestStatus value,
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

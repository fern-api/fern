using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedCsharpBytesUploadPathParam.Core;

namespace SeedCsharpBytesUploadPathParam;

[JsonConverter(typeof(BucketRegion.BucketRegionSerializer))]
[Serializable]
public readonly record struct BucketRegion : IStringEnum
{
    public static readonly BucketRegion UsEast = new(Values.UsEast);

    public static readonly BucketRegion EuWest = new(Values.EuWest);

    public BucketRegion(string value)
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
    public static BucketRegion FromCustom(string value)
    {
        return new BucketRegion(value);
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

    public static bool operator ==(BucketRegion value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(BucketRegion value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(BucketRegion value) => value.Value;

    public static explicit operator BucketRegion(string value) => new(value);

    internal class BucketRegionSerializer : JsonConverter<BucketRegion>
    {
        public override BucketRegion Read(
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
            return new BucketRegion(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            BucketRegion value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override BucketRegion ReadAsPropertyName(
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
            return new BucketRegion(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            BucketRegion value,
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
        public const string UsEast = "us-east";

        public const string EuWest = "eu-west";
    }
}

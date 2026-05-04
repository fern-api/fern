using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(
    typeof(CompletionFullResponseFinishReason.CompletionFullResponseFinishReasonSerializer)
)]
[Serializable]
public readonly record struct CompletionFullResponseFinishReason : IStringEnum
{
    public static readonly CompletionFullResponseFinishReason Complete = new(Values.Complete);

    public static readonly CompletionFullResponseFinishReason Length = new(Values.Length);

    public static readonly CompletionFullResponseFinishReason Error = new(Values.Error);

    public CompletionFullResponseFinishReason(string value)
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
    public static CompletionFullResponseFinishReason FromCustom(string value)
    {
        return new CompletionFullResponseFinishReason(value);
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

    public static bool operator ==(CompletionFullResponseFinishReason value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(CompletionFullResponseFinishReason value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(CompletionFullResponseFinishReason value) => value.Value;

    public static explicit operator CompletionFullResponseFinishReason(string value) => new(value);

    internal class CompletionFullResponseFinishReasonSerializer
        : JsonConverter<CompletionFullResponseFinishReason>
    {
        public override CompletionFullResponseFinishReason Read(
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
            return new CompletionFullResponseFinishReason(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            CompletionFullResponseFinishReason value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override CompletionFullResponseFinishReason ReadAsPropertyName(
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
            return new CompletionFullResponseFinishReason(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            CompletionFullResponseFinishReason value,
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
        public const string Complete = "complete";

        public const string Length = "length";

        public const string Error = "error";
    }
}

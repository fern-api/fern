using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(MovieType.MovieTypeSerializer))]
[Serializable]
public readonly record struct MovieType : IStringEnum
{
    public static readonly MovieType Movie = new(Values.Movie);

    public MovieType(string value)
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
    public static MovieType FromCustom(string value)
    {
        return new MovieType(value);
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

    public static bool operator ==(MovieType value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(MovieType value1, string value2) => !value1.Value.Equals(value2);

    public static explicit operator string(MovieType value) => value.Value;

    public static explicit operator MovieType(string value) => new(value);

    internal class MovieTypeSerializer : JsonConverter<MovieType>
    {
        public override MovieType Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new global::System.Exception(
                    "The JSON value could not be read as a string."
                );
            return new MovieType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            MovieType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override MovieType ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new global::System.Exception(
                    "The JSON property name could not be read as a string."
                );
            return new MovieType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            MovieType value,
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
        public const string Movie = "movie";
    }
}

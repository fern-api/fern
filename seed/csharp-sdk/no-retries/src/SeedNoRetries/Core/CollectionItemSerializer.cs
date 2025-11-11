using System.Text.Json;
using System.Text.Json.Serialization;

namespace SeedNoRetries.Core;

/// <summary>
/// Json collection converter.
/// </summary>
/// <typeparam name="TDatatype">Type of item to convert.</typeparam>
/// <typeparam name="TConverterType">Converter to use for individual items.</typeparam>
internal class CollectionItemSerializer<TDatatype, TConverterType>
    : JsonConverter<IEnumerable<TDatatype>>
    where TConverterType : JsonConverter
{
    /// <summary>
    /// Reads a json string and deserializes it into an object.
    /// </summary>
    /// <param name="reader">Json reader.</param>
    /// <param name="typeToConvert">Type to convert.</param>
    /// <param name="options">Serializer options.</param>
    /// <returns>Created object.</returns>
    public override IEnumerable<TDatatype>? Read(
        ref Utf8JsonReader reader,
        global::System.Type typeToConvert,
        JsonSerializerOptions options
    )
    {
        if (reader.TokenType == JsonTokenType.Null)
        {
            return default;
        }

        var jsonSerializerOptions = new JsonSerializerOptions(options);
        jsonSerializerOptions.Converters.Clear();
        jsonSerializerOptions.Converters.Add(Activator.CreateInstance<TConverterType>());

        var returnValue = new List<TDatatype>();

        while (reader.TokenType != JsonTokenType.EndArray)
        {
            if (reader.TokenType != JsonTokenType.StartArray)
            {
                var item = (TDatatype)(
                    JsonSerializer.Deserialize(ref reader, typeof(TDatatype), jsonSerializerOptions)
                    ?? throw new global::System.Exception(
                        $"Failed to deserialize collection item of type {typeof(TDatatype)}"
                    )
                );
                returnValue.Add(item);
            }

            reader.Read();
        }

        return returnValue;
    }

    /// <summary>
    /// Writes a json string.
    /// </summary>
    /// <param name="writer">Json writer.</param>
    /// <param name="value">Value to write.</param>
    /// <param name="options">Serializer options.</param>
    public override void Write(
        Utf8JsonWriter writer,
        IEnumerable<TDatatype>? value,
        JsonSerializerOptions options
    )
    {
        if (value == null)
        {
            writer.WriteNullValue();
            return;
        }

        var jsonSerializerOptions = new JsonSerializerOptions(options);
        jsonSerializerOptions.Converters.Clear();
        jsonSerializerOptions.Converters.Add(Activator.CreateInstance<TConverterType>());

        writer.WriteStartArray();

        foreach (var data in value)
        {
            JsonSerializer.Serialize(writer, data, jsonSerializerOptions);
        }

        writer.WriteEndArray();
    }
}

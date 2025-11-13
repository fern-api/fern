// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(PlaylistIdNotFoundErrorBody.JsonConverter))]
[Serializable]
public record PlaylistIdNotFoundErrorBody
{
    internal PlaylistIdNotFoundErrorBody(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of PlaylistIdNotFoundErrorBody with <see cref="PlaylistIdNotFoundErrorBody.PlaylistId"/>.
    /// </summary>
    public PlaylistIdNotFoundErrorBody(PlaylistIdNotFoundErrorBody.PlaylistId value)
    {
        Type = "playlistId";
        Value = value.Value;
    }

    /// <summary>
    /// Discriminant value
    /// </summary>
    [JsonPropertyName("type")]
    public string Type { get; internal set; }

    /// <summary>
    /// Discriminated union value
    /// </summary>
    public object? Value { get; internal set; }

    /// <summary>
    /// Returns true if <see cref="Type"/> is "playlistId"
    /// </summary>
    public bool IsPlaylistId => Type == "playlistId";

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'playlistId', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'playlistId'.</exception>
    public string AsPlaylistId() =>
        IsPlaylistId
            ? (string)Value!
            : throw new System.Exception("PlaylistIdNotFoundErrorBody.Type is not 'playlistId'");

    public T Match<T>(Func<string, T> onPlaylistId, Func<string, object?, T> onUnknown_)
    {
        return Type switch
        {
            "playlistId" => onPlaylistId(AsPlaylistId()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(Action<string> onPlaylistId, Action<string, object?> onUnknown_)
    {
        switch (Type)
        {
            case "playlistId":
                onPlaylistId(AsPlaylistId());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="string"/> and returns true if successful.
    /// </summary>
    public bool TryAsPlaylistId(out string? value)
    {
        if (Type == "playlistId")
        {
            value = (string)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator PlaylistIdNotFoundErrorBody(
        PlaylistIdNotFoundErrorBody.PlaylistId value
    ) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<PlaylistIdNotFoundErrorBody>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(PlaylistIdNotFoundErrorBody).IsAssignableFrom(typeToConvert);

        public override PlaylistIdNotFoundErrorBody Read(
            ref Utf8JsonReader reader,
            System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = JsonElement.ParseValue(ref reader);
            if (!json.TryGetProperty("type", out var discriminatorElement))
            {
                throw new JsonException("Missing discriminator property 'type'");
            }
            if (discriminatorElement.ValueKind != JsonValueKind.String)
            {
                if (discriminatorElement.ValueKind == JsonValueKind.Null)
                {
                    throw new JsonException("Discriminator property 'type' is null");
                }

                throw new JsonException(
                    $"Discriminator property 'type' is not a string, instead is {discriminatorElement.ToString()}"
                );
            }

            var discriminator =
                discriminatorElement.GetString()
                ?? throw new JsonException("Discriminator property 'type' is null");

            var value = discriminator switch
            {
                "playlistId" => json.GetProperty("value").Deserialize<string?>(options)
                ?? throw new JsonException("Failed to deserialize string"),
                _ => json.Deserialize<object?>(options),
            };
            return new PlaylistIdNotFoundErrorBody(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            PlaylistIdNotFoundErrorBody value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "playlistId" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for playlistId
    /// </summary>
    [Serializable]
    public record PlaylistId
    {
        public PlaylistId(string value)
        {
            Value = value;
        }

        internal string Value { get; set; }

        public override string ToString() => Value;

        public static implicit operator PlaylistIdNotFoundErrorBody.PlaylistId(string value) =>
            new(value);
    }
}

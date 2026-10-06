// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(ResponseChildrenItem.JsonConverter))]
[Serializable]
public class ResponseChildrenItem
{
    private ResponseChildrenItem(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Type discriminator
    /// </summary>
    [JsonIgnore]
    public string Type { get; internal set; }

    /// <summary>
    /// Union value
    /// </summary>
    [JsonIgnore]
    public object? Value { get; internal set; }

    /// <summary>
    /// Factory method to create a union from a <see cref="SeedApi.Say"/> value.
    /// </summary>
    public static ResponseChildrenItem FromSay(SeedApi.Say value) => new("say", value);

    /// <summary>
    /// Factory method to create a union from a <see cref="SeedApi.Dial"/> value.
    /// </summary>
    public static ResponseChildrenItem FromDial(SeedApi.Dial value) => new("dial", value);

    /// <summary>
    /// Factory method to create a union from a <see cref="SeedApi.Pause"/> value.
    /// </summary>
    public static ResponseChildrenItem FromPause(SeedApi.Pause value) => new("pause", value);

    /// <summary>
    /// Factory method to create a union from a <see cref="SeedApi.Hangup"/> value.
    /// </summary>
    public static ResponseChildrenItem FromHangup(SeedApi.Hangup value) => new("hangup", value);

    /// <summary>
    /// Returns true if <see cref="Type"/> is "say"
    /// </summary>
    public bool IsSay() => Type == "say";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "dial"
    /// </summary>
    public bool IsDial() => Type == "dial";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "pause"
    /// </summary>
    public bool IsPause() => Type == "pause";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "hangup"
    /// </summary>
    public bool IsHangup() => Type == "hangup";

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.Say"/> if <see cref="Type"/> is 'say', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedApiException">Thrown when <see cref="Type"/> is not 'say'.</exception>
    public SeedApi.Say AsSay() =>
        IsSay() ? (SeedApi.Say)Value! : throw new SeedApiException("Union type is not 'say'");

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.Dial"/> if <see cref="Type"/> is 'dial', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedApiException">Thrown when <see cref="Type"/> is not 'dial'.</exception>
    public SeedApi.Dial AsDial() =>
        IsDial() ? (SeedApi.Dial)Value! : throw new SeedApiException("Union type is not 'dial'");

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.Pause"/> if <see cref="Type"/> is 'pause', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedApiException">Thrown when <see cref="Type"/> is not 'pause'.</exception>
    public SeedApi.Pause AsPause() =>
        IsPause() ? (SeedApi.Pause)Value! : throw new SeedApiException("Union type is not 'pause'");

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.Hangup"/> if <see cref="Type"/> is 'hangup', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedApiException">Thrown when <see cref="Type"/> is not 'hangup'.</exception>
    public SeedApi.Hangup AsHangup() =>
        IsHangup()
            ? (SeedApi.Hangup)Value!
            : throw new SeedApiException("Union type is not 'hangup'");

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.Say"/> and returns true if successful.
    /// </summary>
    public bool TryGetSay(out SeedApi.Say? value)
    {
        if (Type == "say")
        {
            value = (SeedApi.Say)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.Dial"/> and returns true if successful.
    /// </summary>
    public bool TryGetDial(out SeedApi.Dial? value)
    {
        if (Type == "dial")
        {
            value = (SeedApi.Dial)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.Pause"/> and returns true if successful.
    /// </summary>
    public bool TryGetPause(out SeedApi.Pause? value)
    {
        if (Type == "pause")
        {
            value = (SeedApi.Pause)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.Hangup"/> and returns true if successful.
    /// </summary>
    public bool TryGetHangup(out SeedApi.Hangup? value)
    {
        if (Type == "hangup")
        {
            value = (SeedApi.Hangup)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public T Match<T>(
        Func<SeedApi.Say, T> onSay,
        Func<SeedApi.Dial, T> onDial,
        Func<SeedApi.Pause, T> onPause,
        Func<SeedApi.Hangup, T> onHangup
    )
    {
        return Type switch
        {
            "say" => onSay(AsSay()),
            "dial" => onDial(AsDial()),
            "pause" => onPause(AsPause()),
            "hangup" => onHangup(AsHangup()),
            _ => throw new SeedApiException($"Unknown union type: {Type}"),
        };
    }

    public void Visit(
        Action<SeedApi.Say> onSay,
        Action<SeedApi.Dial> onDial,
        Action<SeedApi.Pause> onPause,
        Action<SeedApi.Hangup> onHangup
    )
    {
        switch (Type)
        {
            case "say":
                onSay(AsSay());
                break;
            case "dial":
                onDial(AsDial());
                break;
            case "pause":
                onPause(AsPause());
                break;
            case "hangup":
                onHangup(AsHangup());
                break;
            default:
                throw new SeedApiException($"Unknown union type: {Type}");
        }
    }

    public override int GetHashCode()
    {
        unchecked
        {
            var hashCode = Type.GetHashCode();
            if (Value != null)
            {
                hashCode = (hashCode * 397) ^ Value.GetHashCode();
            }
            return hashCode;
        }
    }

    public override bool Equals(object? obj)
    {
        if (obj is null)
            return false;
        if (ReferenceEquals(this, obj))
            return true;
        if (obj is not ResponseChildrenItem other)
            return false;

        // Compare type discriminators
        if (Type != other.Type)
            return false;

        // Compare values using EqualityComparer for deep comparison
        return System.Collections.Generic.EqualityComparer<object?>.Default.Equals(
            Value,
            other.Value
        );
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator ResponseChildrenItem(SeedApi.Say value) => new("say", value);

    public static implicit operator ResponseChildrenItem(SeedApi.Dial value) => new("dial", value);

    public static implicit operator ResponseChildrenItem(SeedApi.Pause value) =>
        new("pause", value);

    public static implicit operator ResponseChildrenItem(SeedApi.Hangup value) =>
        new("hangup", value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<ResponseChildrenItem>
    {
        public override ResponseChildrenItem? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            if (reader.TokenType == JsonTokenType.StartObject)
            {
                var document = JsonDocument.ParseValue(ref reader);

                var types = new (string Key, System.Type Type)[]
                {
                    ("say", typeof(SeedApi.Say)),
                    ("dial", typeof(SeedApi.Dial)),
                    ("pause", typeof(SeedApi.Pause)),
                    ("hangup", typeof(SeedApi.Hangup)),
                };

                foreach (var (key, type) in types)
                {
                    try
                    {
                        var value = document.Deserialize(type, options);
                        if (value != null)
                        {
                            ResponseChildrenItem result = new(key, value);
                            return result;
                        }
                    }
                    catch (JsonException)
                    {
                        // Try next type;
                    }
                }
            }

            throw new JsonException(
                $"Cannot deserialize JSON token {reader.TokenType} into ResponseChildrenItem"
            );
        }

        public override void Write(
            Utf8JsonWriter writer,
            ResponseChildrenItem value,
            JsonSerializerOptions options
        )
        {
            if (value == null)
            {
                writer.WriteNullValue();
                return;
            }

            value.Visit(
                obj => JsonSerializer.Serialize(writer, obj, options),
                obj => JsonSerializer.Serialize(writer, obj, options),
                obj => JsonSerializer.Serialize(writer, obj, options),
                obj => JsonSerializer.Serialize(writer, obj, options)
            );
        }

        public override ResponseChildrenItem ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue = reader.GetString()!;
            ResponseChildrenItem result = new("string", stringValue);
            return result;
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ResponseChildrenItem value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Value?.ToString() ?? "null");
        }
    }
}

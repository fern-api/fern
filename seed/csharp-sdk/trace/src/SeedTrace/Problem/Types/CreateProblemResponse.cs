// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(CreateProblemResponse.JsonConverter))]
[Serializable]
public record CreateProblemResponse
{
    internal CreateProblemResponse(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of CreateProblemResponse with <see cref="CreateProblemResponse.Success"/>.
    /// </summary>
    public CreateProblemResponse(CreateProblemResponse.Success value)
    {
        Type = "success";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of CreateProblemResponse with <see cref="CreateProblemResponse.Error"/>.
    /// </summary>
    public CreateProblemResponse(CreateProblemResponse.Error value)
    {
        Type = "error";
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
    /// Returns true if <see cref="Type"/> is "success"
    /// </summary>
    public bool IsSuccess => Type == "success";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "error"
    /// </summary>
    public bool IsError => Type == "error";

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'success', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'success'.</exception>
    public string AsSuccess() =>
        IsSuccess
            ? (string)Value!
            : throw new System.Exception("CreateProblemResponse.Type is not 'success'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.CreateProblemError"/> if <see cref="Type"/> is 'error', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'error'.</exception>
    public SeedTrace.CreateProblemError AsError() =>
        IsError
            ? (SeedTrace.CreateProblemError)Value!
            : throw new System.Exception("CreateProblemResponse.Type is not 'error'");

    public T Match<T>(
        Func<string, T> onSuccess,
        Func<SeedTrace.CreateProblemError, T> onError,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "success" => onSuccess(AsSuccess()),
            "error" => onError(AsError()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<string> onSuccess,
        Action<SeedTrace.CreateProblemError> onError,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "success":
                onSuccess(AsSuccess());
                break;
            case "error":
                onError(AsError());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="string"/> and returns true if successful.
    /// </summary>
    public bool TryAsSuccess(out string? value)
    {
        if (Type == "success")
        {
            value = (string)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.CreateProblemError"/> and returns true if successful.
    /// </summary>
    public bool TryAsError(out SeedTrace.CreateProblemError? value)
    {
        if (Type == "error")
        {
            value = (SeedTrace.CreateProblemError)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator CreateProblemResponse(CreateProblemResponse.Success value) =>
        new(value);

    public static implicit operator CreateProblemResponse(CreateProblemResponse.Error value) =>
        new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<CreateProblemResponse>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(CreateProblemResponse).IsAssignableFrom(typeToConvert);

        public override CreateProblemResponse Read(
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
                "success" => json.GetProperty("value").Deserialize<string?>(options)
                ?? throw new JsonException("Failed to deserialize string"),
                "error" => json.GetProperty("value")
                    .Deserialize<SeedTrace.CreateProblemError?>(options)
                ?? throw new JsonException("Failed to deserialize SeedTrace.CreateProblemError"),
                _ => json.Deserialize<object?>(options),
            };
            return new CreateProblemResponse(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            CreateProblemResponse value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "success" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "error" => new JsonObject
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
    /// Discriminated union type for success
    /// </summary>
    [Serializable]
    public record Success
    {
        public Success(string value)
        {
            Value = value;
        }

        internal string Value { get; set; }

        public override string ToString() => Value;

        public static implicit operator CreateProblemResponse.Success(string value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for error
    /// </summary>
    [Serializable]
    public struct Error
    {
        public Error(SeedTrace.CreateProblemError value)
        {
            Value = value;
        }

        internal SeedTrace.CreateProblemError Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator CreateProblemResponse.Error(
            SeedTrace.CreateProblemError value
        ) => new(value);
    }
}

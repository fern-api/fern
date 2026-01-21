// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedNullable.Core;

namespace SeedNullable;

[JsonConverter(typeof(Status.JsonConverter))]
[Serializable]
public record Status
{
    internal Status(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of Status with <see cref="Status.Active"/>.
    /// </summary>
    public Status(Status.Active value)
    {
        Type = "active";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of Status with <see cref="Status.Archived"/>.
    /// </summary>
    public Status(Status.Archived value)
    {
        Type = "archived";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of Status with <see cref="Status.SoftDeleted"/>.
    /// </summary>
    public Status(Status.SoftDeleted value)
    {
        Type = "soft-deleted";
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
    /// Returns true if <see cref="Type"/> is "active"
    /// </summary>
    public bool IsActive => Type == "active";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "archived"
    /// </summary>
    public bool IsArchived => Type == "archived";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "soft-deleted"
    /// </summary>
    public bool IsSoftDeleted => Type == "soft-deleted";

    /// <summary>
    /// Returns the value as a <see cref="object"/> if <see cref="Type"/> is 'active', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'active'.</exception>
    public object AsActive() =>
        IsActive ? Value! : throw new System.Exception("Status.Type is not 'active'");

    /// <summary>
    /// Returns the value as a <see cref="DateTime?"/> if <see cref="Type"/> is 'archived', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'archived'.</exception>
    public DateTime? AsArchived() =>
        IsArchived
            ? (DateTime?)Value!
            : throw new System.Exception("Status.Type is not 'archived'");

    /// <summary>
    /// Returns the value as a <see cref="DateTime?"/> if <see cref="Type"/> is 'soft-deleted', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'soft-deleted'.</exception>
    public DateTime? AsSoftDeleted() =>
        IsSoftDeleted
            ? (DateTime?)Value!
            : throw new System.Exception("Status.Type is not 'soft-deleted'");

    public T Match<T>(
        Func<object, T> onActive,
        Func<DateTime?, T> onArchived,
        Func<DateTime?, T> onSoftDeleted,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "active" => onActive(AsActive()),
            "archived" => onArchived(AsArchived()),
            "soft-deleted" => onSoftDeleted(AsSoftDeleted()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<object> onActive,
        Action<DateTime?> onArchived,
        Action<DateTime?> onSoftDeleted,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "active":
                onActive(AsActive());
                break;
            case "archived":
                onArchived(AsArchived());
                break;
            case "soft-deleted":
                onSoftDeleted(AsSoftDeleted());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="object"/> and returns true if successful.
    /// </summary>
    public bool TryAsActive(out object? value)
    {
        if (Type == "active")
        {
            value = Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="DateTime?"/> and returns true if successful.
    /// </summary>
    public bool TryAsArchived(out DateTime? value)
    {
        if (Type == "archived")
        {
            value = (DateTime?)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="DateTime?"/> and returns true if successful.
    /// </summary>
    public bool TryAsSoftDeleted(out DateTime? value)
    {
        if (Type == "soft-deleted")
        {
            value = (DateTime?)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator Status(Status.Archived value) => new(value);

    public static implicit operator Status(Status.SoftDeleted value) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Status>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(Status).IsAssignableFrom(typeToConvert);

        public override Status Read(
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
                "active" => new { },
                "archived" => json.GetProperty("value").Deserialize<DateTime?>(options),
                "soft-deleted" => json.GetProperty("value").Deserialize<DateTime?>(options),
                _ => json.Deserialize<object?>(options),
            };
            return new Status(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            Status value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "active" => null,
                    "archived" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "soft-deleted" => new JsonObject
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
    /// Discriminated union type for active
    /// </summary>
    [Serializable]
    public record Active
    {
        internal object Value => new { };

        public override string ToString() => Value.ToString() ?? "null";
    }

    /// <summary>
    /// Discriminated union type for archived
    /// </summary>
    [Serializable]
    public record Archived
    {
        public Archived(DateTime? value)
        {
            Value = value;
        }

        internal DateTime? Value { get; set; }

        public override string ToString() => Value?.ToString() ?? "null";

        public static implicit operator Status.Archived(DateTime? value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for soft-deleted
    /// </summary>
    [Serializable]
    public record SoftDeleted
    {
        public SoftDeleted(DateTime? value)
        {
            Value = value;
        }

        internal DateTime? Value { get; set; }

        public override string ToString() => Value?.ToString() ?? "null";

        public static implicit operator Status.SoftDeleted(DateTime? value) => new(value);
    }
}

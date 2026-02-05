// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(VariableType.JsonConverter))]
[Serializable]
public record VariableType
{
    internal VariableType(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of VariableType with <see cref="VariableType.IntegerType"/>.
    /// </summary>
    public VariableType(VariableType.IntegerType value)
    {
        Type = "integerType";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of VariableType with <see cref="VariableType.DoubleType"/>.
    /// </summary>
    public VariableType(VariableType.DoubleType value)
    {
        Type = "doubleType";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of VariableType with <see cref="VariableType.BooleanType"/>.
    /// </summary>
    public VariableType(VariableType.BooleanType value)
    {
        Type = "booleanType";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of VariableType with <see cref="VariableType.StringType"/>.
    /// </summary>
    public VariableType(VariableType.StringType value)
    {
        Type = "stringType";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of VariableType with <see cref="VariableType.CharType"/>.
    /// </summary>
    public VariableType(VariableType.CharType value)
    {
        Type = "charType";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of VariableType with <see cref="VariableType.ListType"/>.
    /// </summary>
    public VariableType(VariableType.ListType value)
    {
        Type = "listType";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of VariableType with <see cref="VariableType.MapType"/>.
    /// </summary>
    public VariableType(VariableType.MapType value)
    {
        Type = "mapType";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of VariableType with <see cref="VariableType.BinaryTreeType"/>.
    /// </summary>
    public VariableType(VariableType.BinaryTreeType value)
    {
        Type = "binaryTreeType";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of VariableType with <see cref="VariableType.SinglyLinkedListType"/>.
    /// </summary>
    public VariableType(VariableType.SinglyLinkedListType value)
    {
        Type = "singlyLinkedListType";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of VariableType with <see cref="VariableType.DoublyLinkedListType"/>.
    /// </summary>
    public VariableType(VariableType.DoublyLinkedListType value)
    {
        Type = "doublyLinkedListType";
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
    /// Returns true if <see cref="Type"/> is "integerType"
    /// </summary>
    public bool IsIntegerType => Type == "integerType";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "doubleType"
    /// </summary>
    public bool IsDoubleType => Type == "doubleType";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "booleanType"
    /// </summary>
    public bool IsBooleanType => Type == "booleanType";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "stringType"
    /// </summary>
    public bool IsStringType => Type == "stringType";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "charType"
    /// </summary>
    public bool IsCharType => Type == "charType";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "listType"
    /// </summary>
    public bool IsListType => Type == "listType";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "mapType"
    /// </summary>
    public bool IsMapType => Type == "mapType";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "binaryTreeType"
    /// </summary>
    public bool IsBinaryTreeType => Type == "binaryTreeType";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "singlyLinkedListType"
    /// </summary>
    public bool IsSinglyLinkedListType => Type == "singlyLinkedListType";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "doublyLinkedListType"
    /// </summary>
    public bool IsDoublyLinkedListType => Type == "doublyLinkedListType";

    /// <summary>
    /// Returns the value as a <see cref="object"/> if <see cref="Type"/> is 'integerType', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'integerType'.</exception>
    public object AsIntegerType() =>
        IsIntegerType
            ? Value!
            : throw new System.Exception("VariableType.Type is not 'integerType'");

    /// <summary>
    /// Returns the value as a <see cref="object"/> if <see cref="Type"/> is 'doubleType', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'doubleType'.</exception>
    public object AsDoubleType() =>
        IsDoubleType ? Value! : throw new System.Exception("VariableType.Type is not 'doubleType'");

    /// <summary>
    /// Returns the value as a <see cref="object"/> if <see cref="Type"/> is 'booleanType', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'booleanType'.</exception>
    public object AsBooleanType() =>
        IsBooleanType
            ? Value!
            : throw new System.Exception("VariableType.Type is not 'booleanType'");

    /// <summary>
    /// Returns the value as a <see cref="object"/> if <see cref="Type"/> is 'stringType', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'stringType'.</exception>
    public object AsStringType() =>
        IsStringType ? Value! : throw new System.Exception("VariableType.Type is not 'stringType'");

    /// <summary>
    /// Returns the value as a <see cref="object"/> if <see cref="Type"/> is 'charType', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'charType'.</exception>
    public object AsCharType() =>
        IsCharType ? Value! : throw new System.Exception("VariableType.Type is not 'charType'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.ListType"/> if <see cref="Type"/> is 'listType', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'listType'.</exception>
    public SeedTrace.ListType AsListType() =>
        IsListType
            ? (SeedTrace.ListType)Value!
            : throw new System.Exception("VariableType.Type is not 'listType'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.MapType"/> if <see cref="Type"/> is 'mapType', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'mapType'.</exception>
    public SeedTrace.MapType AsMapType() =>
        IsMapType
            ? (SeedTrace.MapType)Value!
            : throw new System.Exception("VariableType.Type is not 'mapType'");

    /// <summary>
    /// Returns the value as a <see cref="object"/> if <see cref="Type"/> is 'binaryTreeType', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'binaryTreeType'.</exception>
    public object AsBinaryTreeType() =>
        IsBinaryTreeType
            ? Value!
            : throw new System.Exception("VariableType.Type is not 'binaryTreeType'");

    /// <summary>
    /// Returns the value as a <see cref="object"/> if <see cref="Type"/> is 'singlyLinkedListType', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'singlyLinkedListType'.</exception>
    public object AsSinglyLinkedListType() =>
        IsSinglyLinkedListType
            ? Value!
            : throw new System.Exception("VariableType.Type is not 'singlyLinkedListType'");

    /// <summary>
    /// Returns the value as a <see cref="object"/> if <see cref="Type"/> is 'doublyLinkedListType', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'doublyLinkedListType'.</exception>
    public object AsDoublyLinkedListType() =>
        IsDoublyLinkedListType
            ? Value!
            : throw new System.Exception("VariableType.Type is not 'doublyLinkedListType'");

    public T Match<T>(
        Func<object, T> onIntegerType,
        Func<object, T> onDoubleType,
        Func<object, T> onBooleanType,
        Func<object, T> onStringType,
        Func<object, T> onCharType,
        Func<SeedTrace.ListType, T> onListType,
        Func<SeedTrace.MapType, T> onMapType,
        Func<object, T> onBinaryTreeType,
        Func<object, T> onSinglyLinkedListType,
        Func<object, T> onDoublyLinkedListType,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "integerType" => onIntegerType(AsIntegerType()),
            "doubleType" => onDoubleType(AsDoubleType()),
            "booleanType" => onBooleanType(AsBooleanType()),
            "stringType" => onStringType(AsStringType()),
            "charType" => onCharType(AsCharType()),
            "listType" => onListType(AsListType()),
            "mapType" => onMapType(AsMapType()),
            "binaryTreeType" => onBinaryTreeType(AsBinaryTreeType()),
            "singlyLinkedListType" => onSinglyLinkedListType(AsSinglyLinkedListType()),
            "doublyLinkedListType" => onDoublyLinkedListType(AsDoublyLinkedListType()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<object> onIntegerType,
        Action<object> onDoubleType,
        Action<object> onBooleanType,
        Action<object> onStringType,
        Action<object> onCharType,
        Action<SeedTrace.ListType> onListType,
        Action<SeedTrace.MapType> onMapType,
        Action<object> onBinaryTreeType,
        Action<object> onSinglyLinkedListType,
        Action<object> onDoublyLinkedListType,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "integerType":
                onIntegerType(AsIntegerType());
                break;
            case "doubleType":
                onDoubleType(AsDoubleType());
                break;
            case "booleanType":
                onBooleanType(AsBooleanType());
                break;
            case "stringType":
                onStringType(AsStringType());
                break;
            case "charType":
                onCharType(AsCharType());
                break;
            case "listType":
                onListType(AsListType());
                break;
            case "mapType":
                onMapType(AsMapType());
                break;
            case "binaryTreeType":
                onBinaryTreeType(AsBinaryTreeType());
                break;
            case "singlyLinkedListType":
                onSinglyLinkedListType(AsSinglyLinkedListType());
                break;
            case "doublyLinkedListType":
                onDoublyLinkedListType(AsDoublyLinkedListType());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="object"/> and returns true if successful.
    /// </summary>
    public bool TryAsIntegerType(out object? value)
    {
        if (Type == "integerType")
        {
            value = Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="object"/> and returns true if successful.
    /// </summary>
    public bool TryAsDoubleType(out object? value)
    {
        if (Type == "doubleType")
        {
            value = Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="object"/> and returns true if successful.
    /// </summary>
    public bool TryAsBooleanType(out object? value)
    {
        if (Type == "booleanType")
        {
            value = Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="object"/> and returns true if successful.
    /// </summary>
    public bool TryAsStringType(out object? value)
    {
        if (Type == "stringType")
        {
            value = Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="object"/> and returns true if successful.
    /// </summary>
    public bool TryAsCharType(out object? value)
    {
        if (Type == "charType")
        {
            value = Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.ListType"/> and returns true if successful.
    /// </summary>
    public bool TryAsListType(out SeedTrace.ListType? value)
    {
        if (Type == "listType")
        {
            value = (SeedTrace.ListType)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.MapType"/> and returns true if successful.
    /// </summary>
    public bool TryAsMapType(out SeedTrace.MapType? value)
    {
        if (Type == "mapType")
        {
            value = (SeedTrace.MapType)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="object"/> and returns true if successful.
    /// </summary>
    public bool TryAsBinaryTreeType(out object? value)
    {
        if (Type == "binaryTreeType")
        {
            value = Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="object"/> and returns true if successful.
    /// </summary>
    public bool TryAsSinglyLinkedListType(out object? value)
    {
        if (Type == "singlyLinkedListType")
        {
            value = Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="object"/> and returns true if successful.
    /// </summary>
    public bool TryAsDoublyLinkedListType(out object? value)
    {
        if (Type == "doublyLinkedListType")
        {
            value = Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator VariableType(VariableType.ListType value) => new(value);

    public static implicit operator VariableType(VariableType.MapType value) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<VariableType>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(VariableType).IsAssignableFrom(typeToConvert);

        public override VariableType Read(
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
                "integerType" => new { },
                "doubleType" => new { },
                "booleanType" => new { },
                "stringType" => new { },
                "charType" => new { },
                "listType" => json.Deserialize<SeedTrace.ListType?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedTrace.ListType"),
                "mapType" => json.Deserialize<SeedTrace.MapType?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedTrace.MapType"),
                "binaryTreeType" => new { },
                "singlyLinkedListType" => new { },
                "doublyLinkedListType" => new { },
                _ => json.Deserialize<object?>(options),
            };
            return new VariableType(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            VariableType value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "integerType" => null,
                    "doubleType" => null,
                    "booleanType" => null,
                    "stringType" => null,
                    "charType" => null,
                    "listType" => JsonSerializer.SerializeToNode(value.Value, options),
                    "mapType" => JsonSerializer.SerializeToNode(value.Value, options),
                    "binaryTreeType" => null,
                    "singlyLinkedListType" => null,
                    "doublyLinkedListType" => null,
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for integerType
    /// </summary>
    [Serializable]
    public record IntegerType
    {
        internal object Value => new { };

        public override string ToString() => Value.ToString() ?? "null";
    }

    /// <summary>
    /// Discriminated union type for doubleType
    /// </summary>
    [Serializable]
    public record DoubleType
    {
        internal object Value => new { };

        public override string ToString() => Value.ToString() ?? "null";
    }

    /// <summary>
    /// Discriminated union type for booleanType
    /// </summary>
    [Serializable]
    public record BooleanType
    {
        internal object Value => new { };

        public override string ToString() => Value.ToString() ?? "null";
    }

    /// <summary>
    /// Discriminated union type for stringType
    /// </summary>
    [Serializable]
    public record StringType
    {
        internal object Value => new { };

        public override string ToString() => Value.ToString() ?? "null";
    }

    /// <summary>
    /// Discriminated union type for charType
    /// </summary>
    [Serializable]
    public record CharType
    {
        internal object Value => new { };

        public override string ToString() => Value.ToString() ?? "null";
    }

    /// <summary>
    /// Discriminated union type for listType
    /// </summary>
    [Serializable]
    public struct ListType
    {
        public ListType(SeedTrace.ListType value)
        {
            Value = value;
        }

        internal SeedTrace.ListType Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator VariableType.ListType(SeedTrace.ListType value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for mapType
    /// </summary>
    [Serializable]
    public struct MapType
    {
        public MapType(SeedTrace.MapType value)
        {
            Value = value;
        }

        internal SeedTrace.MapType Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator VariableType.MapType(SeedTrace.MapType value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for binaryTreeType
    /// </summary>
    [Serializable]
    public record BinaryTreeType
    {
        internal object Value => new { };

        public override string ToString() => Value.ToString() ?? "null";
    }

    /// <summary>
    /// Discriminated union type for singlyLinkedListType
    /// </summary>
    [Serializable]
    public record SinglyLinkedListType
    {
        internal object Value => new { };

        public override string ToString() => Value.ToString() ?? "null";
    }

    /// <summary>
    /// Discriminated union type for doublyLinkedListType
    /// </summary>
    [Serializable]
    public record DoublyLinkedListType
    {
        internal object Value => new { };

        public override string ToString() => Value.ToString() ?? "null";
    }
}

using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using global::System.Text.Json.Serialization.Metadata;
using CultureInfo = global::System.Globalization.CultureInfo;

namespace SeedBasicAuthEnvironmentVariables.Core;

internal static partial class JsonOptions
{
    internal static readonly JsonSerializerOptions JsonSerializerOptions;

    static JsonOptions()
    {
        var options = new JsonSerializerOptions
        {
            Converters = { new DateTimeSerializer(),
#if USE_PORTABLE_DATE_ONLY
                new DateOnlyConverter(),
#endif
                new OneOfSerializer() },
#if DEBUG
            WriteIndented = true,
#endif
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            TypeInfoResolver = new DefaultJsonTypeInfoResolver
            {
                Modifiers =
                {
                    static typeInfo =>
                    {
                        if (typeInfo.Kind != JsonTypeInfoKind.Object)
                            return;

                        foreach (var propertyInfo in typeInfo.Properties)
                        {
                            var jsonAccessAttribute = propertyInfo
                                .AttributeProvider?.GetCustomAttributes(
                                    typeof(JsonAccessAttribute),
                                    true
                                )
                                .OfType<JsonAccessAttribute>()
                                .FirstOrDefault();

                            if (jsonAccessAttribute != null)
                            {
                                propertyInfo.IsRequired = false;
                                switch (jsonAccessAttribute.AccessType)
                                {
                                    case JsonAccessType.ReadOnly:
                                        propertyInfo.Get = null;
                                        propertyInfo.ShouldSerialize = (_, _) => false;
                                        break;
                                    case JsonAccessType.WriteOnly:
                                        propertyInfo.Set = null;
                                        break;
                                    default:
                                        throw new ArgumentOutOfRangeException();
                                }
                            }

                            var jsonIgnoreAttribute = propertyInfo
                                .AttributeProvider?.GetCustomAttributes(
                                    typeof(JsonIgnoreAttribute),
                                    true
                                )
                                .OfType<JsonIgnoreAttribute>()
                                .FirstOrDefault();

                            if (jsonIgnoreAttribute is not null)
                            {
                                propertyInfo.IsRequired = false;
                            }
                        }
                    },
                },
            },
        };
        ConfigureJsonSerializerOptions(options);
        JsonSerializerOptions = options;
    }

    static partial void ConfigureJsonSerializerOptions(JsonSerializerOptions defaultOptions);
}

internal static class JsonUtils
{
    internal static string Serialize<T>(T obj) =>
        JsonSerializer.Serialize(obj, JsonOptions.JsonSerializerOptions);

    internal static JsonElement SerializeToElement<T>(T obj) =>
        JsonSerializer.SerializeToElement(obj, JsonOptions.JsonSerializerOptions);

    internal static JsonDocument SerializeToDocument<T>(T obj) =>
        JsonSerializer.SerializeToDocument(obj, JsonOptions.JsonSerializerOptions);

    internal static JsonNode? SerializeToNode<T>(T obj) =>
        JsonSerializer.SerializeToNode(obj, JsonOptions.JsonSerializerOptions);

    internal static byte[] SerializeToUtf8Bytes<T>(T obj) =>
        JsonSerializer.SerializeToUtf8Bytes(obj, JsonOptions.JsonSerializerOptions);

    internal static string SerializeAsString<T>(T obj)
    {
        return obj switch
        {
            null => "null",
            string str => str,
            true => "true",
            false => "false",
            int i => i.ToString(CultureInfo.InvariantCulture),
            long l => l.ToString(CultureInfo.InvariantCulture),
            float f => f.ToString(CultureInfo.InvariantCulture),
            double d => d.ToString(CultureInfo.InvariantCulture),
            decimal dec => dec.ToString(CultureInfo.InvariantCulture),
            short s => s.ToString(CultureInfo.InvariantCulture),
            ushort u => u.ToString(CultureInfo.InvariantCulture),
            uint u => u.ToString(CultureInfo.InvariantCulture),
            ulong u => u.ToString(CultureInfo.InvariantCulture),
            char c => c.ToString(CultureInfo.InvariantCulture),
            Guid guid => guid.ToString("D"),
            _ => Serialize(obj).Trim('"'),
        };
    }

    internal static T Deserialize<T>(string json) =>
        JsonSerializer.Deserialize<T>(json, JsonOptions.JsonSerializerOptions)!;
}

using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using global::System.Text.Json.Serialization.Metadata;

namespace SeedOauthClientCredentials.Core;

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
        var json = JsonSerializer.Serialize(obj, JsonOptions.JsonSerializerOptions);
        return json.Trim('"');
    }

    internal static T Deserialize<T>(string json) =>
        JsonSerializer.Deserialize<T>(json, JsonOptions.JsonSerializerOptions)!;
}

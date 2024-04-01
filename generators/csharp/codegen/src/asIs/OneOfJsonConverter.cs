using System.Diagnostics;
using System.Reflection;
using System.Text.Json.Serialization;
using System.Text.Json;
using OneOf;

#nullable enable

private class OneOfJsonConverter<T> : JsonConverter<T> where T : IOneOf
{
    private static readonly (Type type, MethodInfo cast)[] s_types = GetOneOfTypes();

    [DebuggerNonUserCode]
    public override T? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType is JsonTokenType.Null)
            return default;

        foreach (var (type, cast) in s_types)
        {
            try
            {
                Utf8JsonReader readerCopy = reader;
                var result = JsonSerializer.Deserialize(ref readerCopy, type, options);
                reader.Skip();
                return (T)cast.Invoke(null, new[] { result })!;
            }
            catch (JsonException)
            {
                continue;
            }
        }

        throw new JsonException($"Cannot deserialize into one of the supported types for {typeToConvert}");
    }

    public override void Write(Utf8JsonWriter writer, T value, JsonSerializerOptions options)
    {
        object obj = value;
        while (obj is IOneOf oneof)
            obj = oneof.Value;

        JsonSerializer.Serialize(writer, obj, options);
    }

    private static (Type type, MethodInfo cast)[] GetOneOfTypes()
    {
        var casts = typeof(T).GetRuntimeMethods().Where(m => m.IsSpecialName && m.Name == "op_Implicit").ToArray();
        var type = typeof(T);
        while (type != null)
        {
            if (type.IsGenericType && (type.Name.StartsWith("OneOf`") || type.Name.StartsWith("OneOfBase`")))
            {
                return type.GetGenericArguments().Select(t => (t, casts.First(c => c.GetParameters()[0].ParameterType == t))).ToArray();
            }

            type = type.BaseType;
        }
        throw new InvalidOperationException($"{typeof(T)} isn't OneOf or OneOfBase");
    }
}

using System.Reflection;
using System.Runtime.Serialization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SeedPackageYml;

#nullable enable

/// <summary>
/// Handles serializing C# enums into the appropriate string values.
/// </summary>
public class JsonEnumMemberStringEnumConverter : JsonConverterFactory
{
    private readonly JsonNamingPolicy? _namingPolicy;
    private readonly bool _allowIntegerValues;
    private readonly JsonStringEnumConverter _baseConverter;

    public JsonEnumMemberStringEnumConverter(
        JsonNamingPolicy? namingPolicy = null,
        bool allowIntegerValues = true
    )
    {
        _namingPolicy = namingPolicy;
        _allowIntegerValues = allowIntegerValues;
        _baseConverter = new JsonStringEnumConverter(namingPolicy, allowIntegerValues);
    }

    public override bool CanConvert(Type typeToConvert) => _baseConverter.CanConvert(typeToConvert);

    public override JsonConverter CreateConverter(Type typeToConvert, JsonSerializerOptions options)
    {
        var query =
            from field in typeToConvert.GetFields(BindingFlags.Public | BindingFlags.Static)
            let attr = field.GetCustomAttribute<EnumMemberAttribute>()
            where attr != null && attr.Value != null
            select (field.Name, attr.Value);
        var dictionary = query.ToDictionary(p => p.Item1, p => p.Item2);
        if (dictionary.Count > 0)
            return new JsonStringEnumConverter(
                new DictionaryLookupNamingPolicy(dictionary, _namingPolicy),
                _allowIntegerValues
            ).CreateConverter(typeToConvert, options);
        else
            return _baseConverter.CreateConverter(typeToConvert, options);
    }
}

public class JsonNamingPolicyDecorator : JsonNamingPolicy
{
    readonly JsonNamingPolicy? _underlyingNamingPolicy;

    protected JsonNamingPolicyDecorator(JsonNamingPolicy? underlyingNamingPolicy)
    {
        _underlyingNamingPolicy = underlyingNamingPolicy;
    }

    public override string ConvertName(string name) =>
        _underlyingNamingPolicy?.ConvertName(name) ?? name;
}

internal class DictionaryLookupNamingPolicy : JsonNamingPolicyDecorator
{
    readonly Dictionary<string, string> dictionary;

    public DictionaryLookupNamingPolicy(
        Dictionary<string, string> dictionary,
        JsonNamingPolicy? underlyingNamingPolicy
    )
        : base(underlyingNamingPolicy) =>
        this.dictionary = dictionary ?? throw new ArgumentNullException();

    public override string ConvertName(string name) =>
        dictionary.TryGetValue(name, out var value) ? value : base.ConvertName(name);
}

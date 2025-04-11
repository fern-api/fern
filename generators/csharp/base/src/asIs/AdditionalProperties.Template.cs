using global::System.Collections;
using global::System.Collections.ObjectModel;
using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using <%= namespace%>.Core;

namespace <%= namespace%>;

public record ReadOnlyAdditionalProperties : ReadOnlyAdditionalProperties<JsonElement>;

public record ReadOnlyAdditionalProperties<T> : IReadOnlyDictionary<string, T>
{
    private readonly Dictionary<string, JsonElement> _extensionData = new();
    private readonly Dictionary<string, T> _convertedCache = new();

    private static T ConvertToT(JsonElement value)
    {
        if (typeof(T) == typeof(JsonElement))
        {
            return (T)(object)value;
        }

        return value.Deserialize<T>(JsonOptions.JsonSerializerOptions)!;
    }

    public void CopyFromExtensionData(IDictionary<string, JsonElement> extensionData)
    {
        _extensionData.Clear();
        _convertedCache.Clear();
        foreach (var kvp in extensionData)
        {
            _extensionData[kvp.Key] = kvp.Value;
            if (kvp.Value is T value)
            {
                _convertedCache[kvp.Key] = value;
            }
        }
    }

    private T GetCached(string key)
    {
        if (_convertedCache.TryGetValue(key, out var cached))
        {
            return cached;
        }

        var value = ConvertToT(_extensionData[key]);
        _convertedCache[key] = value;
        return value;
    }

    public IEnumerator<KeyValuePair<string, T>> GetEnumerator()
    {
        return _extensionData
            .Select(kvp => new KeyValuePair<string, T>(kvp.Key, GetCached(kvp.Key)))
            .GetEnumerator();
    }

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();

    public int Count => _extensionData.Count;

    public bool ContainsKey(string key) => _extensionData.ContainsKey(key);

    public bool TryGetValue(string key, out T value)
    {
        if (_convertedCache.TryGetValue(key, out value!))
        {
            return true;
        }

        if (_extensionData.TryGetValue(key, out var element))
        {
            value = ConvertToT(element);
            _convertedCache[key] = value;
            return true;
        }

        return false;
    }

    public T this[string key] => GetCached(key);

    public IEnumerable<string> Keys => _extensionData.Keys;

    public IEnumerable<T> Values => Keys.Select(GetCached);
}

public record AdditionalProperties : AdditionalProperties<object?>;

public record AdditionalProperties<T> : IDictionary<string, T>
{
    private readonly Dictionary<string, object?> _extensionData;
    private readonly Dictionary<string, T> _convertedExtensionDataCache;

    public AdditionalProperties()
    {
        _extensionData = new Dictionary<string, object?>();
        _convertedExtensionDataCache = new Dictionary<string, T>();
    }

    public AdditionalProperties(IDictionary<string, T> properties)
    {
        _extensionData = new Dictionary<string, object?>(properties.Count);
        _convertedExtensionDataCache = new Dictionary<string, T>(properties.Count);
        foreach (var kvp in properties)
        {
            _extensionData[kvp.Key] = kvp.Value;
            _convertedExtensionDataCache[kvp.Key] = kvp.Value;
        }
    }

    private static T ConvertToT(object? extensionDataValue)
    {
        return extensionDataValue switch
        {
            T value => value,
            JsonElement jsonElement => jsonElement.Deserialize<T>(
                JsonOptions.JsonSerializerOptions
            )!,
            JsonNode jsonNode => jsonNode.Deserialize<T>(JsonOptions.JsonSerializerOptions)!,
            _ => JsonUtils
                .SerializeToElement(extensionDataValue)
                .Deserialize<T>(JsonOptions.JsonSerializerOptions)!,
        };
    }

    internal void CopyFromExtensionData(IDictionary<string, object?> extensionData)
    {
        _extensionData.Clear();
        _convertedExtensionDataCache.Clear();
        foreach (var kvp in extensionData)
        {
            _extensionData[kvp.Key] = kvp.Value;
            if (kvp.Value is T value)
            {
                _convertedExtensionDataCache[kvp.Key] = value;
            }
        }
    }

    internal void CopyToExtensionData(IDictionary<string, object?> extensionData)
    {
        extensionData.Clear();
        foreach (var kvp in _extensionData)
        {
            extensionData[kvp.Key] = kvp.Value;
        }
    }

    public JsonObject ToJsonObject() =>
        (
            JsonUtils.SerializeToNode(_extensionData)
            ?? throw new InvalidOperationException(
                "Failed to serialize AdditionalProperties to JSON Node."
            )
        ).AsObject();

    public JsonNode ToJsonNode() =>
        JsonUtils.SerializeToNode(_extensionData)
        ?? throw new InvalidOperationException(
            "Failed to serialize AdditionalProperties to JSON Node."
        );

    public JsonElement ToJsonElement() => JsonUtils.SerializeToElement(_extensionData);

    public JsonDocument ToJsonDocument() => JsonUtils.SerializeToDocument(_extensionData);

    public IReadOnlyDictionary<string, JsonElement> ToJsonElementDictionary()
    {
        return new ReadOnlyDictionary<string, JsonElement>(
            _extensionData.ToDictionary(
                kvp => kvp.Key,
                kvp =>
                {
                    if (kvp.Value is JsonElement jsonElement)
                    {
                        return jsonElement;
                    }

                    return JsonUtils.SerializeToElement(kvp.Value);
                }
            )
        );
    }

    public ICollection<string> Keys => _extensionData.Keys;

    public ICollection<T> Values
    {
        get
        {
            var values = new T[_extensionData.Count];
            var i = 0;
            foreach (var key in Keys)
            {
                values[i++] = GetCached(key);
            }

            return values;
        }
    }

    private T GetCached(string key)
    {
        if (_convertedExtensionDataCache.TryGetValue(key, out var value))
        {
            return value;
        }

        value = ConvertToT(_extensionData[key]);
        _convertedExtensionDataCache.Add(key, value);
        return value;
    }

    private void SetCached(string key, T value)
    {
        _extensionData[key] = value;
        _convertedExtensionDataCache[key] = value;
    }

    private void AddCached(string key, T value)
    {
        _extensionData.Add(key, value);
        _convertedExtensionDataCache.Add(key, value);
    }

    private bool RemoveCached(string key)
    {
        var isRemoved = _extensionData.Remove(key);
        _convertedExtensionDataCache.Remove(key);
        return isRemoved;
    }

    public int Count => _extensionData.Count;
    public bool IsReadOnly => false;

    public T this[string key]
    {
        get => GetCached(key);
        set => SetCached(key, value);
    }

    public void Add(string key, T value) => AddCached(key, value);

    public void Add(KeyValuePair<string, T> item) => AddCached(item.Key, item.Value);

    public bool Remove(string key) => RemoveCached(key);

    public bool Remove(KeyValuePair<string, T> item) => RemoveCached(item.Key);

    public bool ContainsKey(string key) => _extensionData.ContainsKey(key);

    public bool Contains(KeyValuePair<string, T> item)
    {
        return _extensionData.ContainsKey(item.Key)
            && EqualityComparer<T>.Default.Equals(GetCached(item.Key), item.Value);
    }

    public bool TryGetValue(string key, out T value)
    {
        if (_convertedExtensionDataCache.TryGetValue(key, out value!))
        {
            return true;
        }

        if (_extensionData.TryGetValue(key, out var extensionDataValue))
        {
            value = ConvertToT(extensionDataValue);
            _convertedExtensionDataCache[key] = value;
            return true;
        }

        return false;
    }

    public void Clear()
    {
        _extensionData.Clear();
        _convertedExtensionDataCache.Clear();
    }

    public void CopyTo(KeyValuePair<string, T>[] array, int arrayIndex)
    {
        if (array is null)
        {
            throw new ArgumentNullException(nameof(array));
        }

        if (arrayIndex < 0 || arrayIndex > array.Length)
        {
            throw new ArgumentOutOfRangeException(nameof(arrayIndex));
        }

        if (array.Length - arrayIndex < _extensionData.Count)
        {
            throw new ArgumentException(
                "The array does not have enough space to copy the elements."
            );
        }

        foreach (var kvp in _extensionData)
        {
            array[arrayIndex++] = new KeyValuePair<string, T>(kvp.Key, GetCached(kvp.Key));
        }
    }

    public IEnumerator<KeyValuePair<string, T>> GetEnumerator()
    {
        return _extensionData
            .Select(kvp => new KeyValuePair<string, T>(kvp.Key, GetCached(kvp.Key)))
            .GetEnumerator();
    }

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}

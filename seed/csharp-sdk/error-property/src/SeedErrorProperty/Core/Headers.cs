namespace SeedErrorProperty.Core;

internal sealed class Headers : Dictionary<string, HeaderValue>
{
    public Headers() { }

    public Headers(Dictionary<string, string> value)
    {
        foreach (var kvp in value)
        {
            this[kvp.Key] = new HeaderValue(kvp.Value);
        }
    }

    public Headers(IEnumerable<KeyValuePair<string, HeaderValue>> value)
        : base(value.ToDictionary(e => e.Key, e => e.Value)) { }
}

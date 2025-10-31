namespace SeedUndiscriminatedUnionWithResponseProperty.Core;

/// <summary>
/// Represents the headers sent with the request.
/// </summary>
internal sealed class Headers : Dictionary<string, HeaderValue>
{
    internal Headers() { }

    /// <summary>
    /// Initializes a new instance of the Headers class with the specified value.
    /// </summary>
    /// <param name="value"></param>
    internal Headers(Dictionary<string, string> value)
    {
        foreach (var kvp in value)
        {
            this[kvp.Key] = new HeaderValue(kvp.Value);
        }
    }

    /// <summary>
    /// Initializes a new instance of the Headers class with the specified value.
    /// </summary>
    /// <param name="value"></param>
    internal Headers(IEnumerable<KeyValuePair<string, HeaderValue>> value)
        : base(value.ToDictionary(e => e.Key, e => e.Value)) { }
}

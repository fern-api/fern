using System.Net.Http;

namespace SeedFileUpload.Core;

/// <summary>
/// Encodes an object into a form URL-encoded content.
/// </summary>
public static class FormUrlEncoder
{
    /// <summary>
    /// Encodes an object into a form URL-encoded content.
    /// </summary>
    /// <param name="value">Object to form URL-encode. You can pass in an object or dictionary, but not lists, strings, or primitives.</param>
    /// <exception cref="Exception">Throws when passing in a list, a string, or a primitive value.</exception>
    internal static FormUrlEncodedContent Encode(object value) =>
        new(QueryStringConverter.ToQueryStringCollection(value));
}

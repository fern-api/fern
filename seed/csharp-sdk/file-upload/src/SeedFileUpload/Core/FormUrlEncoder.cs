using System.Net.Http;

namespace SeedFileUpload.Core;

public static class FormUrlEncoder
{
    internal static FormUrlEncodedContent Encode(object value) => new(QueryString.ToQueryStringCollection(value));
}
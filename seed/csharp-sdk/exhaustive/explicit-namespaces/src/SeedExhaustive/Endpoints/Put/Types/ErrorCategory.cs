using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints.Put;

[JsonConverter(typeof(EnumSerializer<ErrorCategory>))]
public enum ErrorCategory
{
    [EnumMember(Value = "API_ERROR")]
    ApiError,

    [EnumMember(Value = "AUTHENTICATION_ERROR")]
    AuthenticationError,

    [EnumMember(Value = "INVALID_REQUEST_ERROR")]
    InvalidRequestError,
}

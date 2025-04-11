using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints;

[JsonConverter(typeof(EnumSerializer<ErrorCode>))]
public enum ErrorCode
{
    [EnumMember(Value = "INTERNAL_SERVER_ERROR")]
    InternalServerError,

    [EnumMember(Value = "UNAUTHORIZED")]
    Unauthorized,

    [EnumMember(Value = "FORBIDDEN")]
    Forbidden,

    [EnumMember(Value = "BAD_REQUEST")]
    BadRequest,

    [EnumMember(Value = "CONFLICT")]
    Conflict,

    [EnumMember(Value = "GONE")]
    Gone,

    [EnumMember(Value = "UNPROCESSABLE_ENTITY")]
    UnprocessableEntity,

    [EnumMember(Value = "NOT_IMPLEMENTED")]
    NotImplemented,

    [EnumMember(Value = "BAD_GATEWAY")]
    BadGateway,

    [EnumMember(Value = "SERVICE_UNAVAILABLE")]
    ServiceUnavailable,

    [EnumMember(Value = "Unknown")]
    Unknown,
}

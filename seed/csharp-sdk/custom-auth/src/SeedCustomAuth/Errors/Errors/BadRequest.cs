using SeedCustomAuth.Core;

namespace SeedCustomAuth;

public sealed class BadRequest(object body) : SeedCustomAuthApiException("BadRequest", 400, body);

using System.Text.Json;
using SeedPropertyAccess.Core;

namespace SeedPropertyAccess;

public partial class SeedPropertyAccessClient : ISeedPropertyAccessClient
{
    private readonly RawClient _client;

    public SeedPropertyAccessClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedPropertyAccess" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernproperty-access/0.0.1" },
            }
        );
        clientOptions ??= new ClientOptions();
        foreach (var header in defaultHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        _client = new RawClient(clientOptions);
    }

    private async Task<WithRawResponse<User>> CreateUserAsyncCore(
        User request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedPropertyAccess.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/users",
                    Body = request,
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                var responseData = JsonUtils.Deserialize<User>(responseBody)!;
                return new WithRawResponse<User>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedPropertyAccessApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedPropertyAccessApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.CreateUserAsync(
    ///     new User
    ///     {
    ///         Id = "id",
    ///         Email = "email",
    ///         Password = "password",
    ///         Profile = new UserProfile
    ///         {
    ///             Name = "name",
    ///             Verification = new UserProfileVerification { Verified = "verified" },
    ///             Ssn = "ssn",
    ///         },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<User> CreateUserAsync(
        User request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<User>(
            CreateUserAsyncCore(request, options, cancellationToken)
        );
    }
}

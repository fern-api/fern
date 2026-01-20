using System.Text.Json;
using SeedMultiLineDocs.Core;

namespace SeedMultiLineDocs;

public partial class UserClient : IUserClient
{
    private RawClient _client;

    internal UserClient(RawClient client)
    {
        _client = client;
        Raw = new WithRawResponseClient(_client);
    }

    public UserClient.WithRawResponseClient Raw { get; }

    /// <summary>
    /// Retrieve a user.
    /// This endpoint is used to retrieve a user.
    /// </summary>
    /// <example><code>
    /// await client.User.GetUserAsync("userId");
    /// </code></example>
    public async Task GetUserAsync(
        string userId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        await Raw.GetUserAsync(userId, options, cancellationToken);
    }

    /// <summary>
    /// Create a new user.
    /// This endpoint is used to create a new user.
    /// </summary>
    /// <example><code>
    /// await client.User.CreateUserAsync(new CreateUserRequest { Name = "name", Age = 1 });
    /// </code></example>
    public async Task<User> CreateUserAsync(
        CreateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.CreateUserAsync(request, options, cancellationToken);
        return response.Data;
    }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }

        /// <summary>
        /// Retrieve a user.
        /// This endpoint is used to retrieve a user.
        /// </summary>
        public async Task<WithRawResponse<object>> GetUserAsync(
            string userId,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.BaseUrl,
                        Method = HttpMethod.Get,
                        Path = string.Format(
                            "users/{0}",
                            ValueConvert.ToPathParameterString(userId)
                        ),
                        Options = options,
                    },
                    cancellationToken
                )
                .ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                return new WithRawResponse<object>
                {
                    Data = new object(),
                    RawResponse = new RawResponse
                    {
                        StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri!,
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedMultiLineDocsApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }

        /// <summary>
        /// Create a new user.
        /// This endpoint is used to create a new user.
        /// </summary>
        public async Task<WithRawResponse<User>> CreateUserAsync(
            CreateUserRequest request,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.BaseUrl,
                        Method = HttpMethod.Post,
                        Path = "users",
                        Body = request,
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
                    var data = JsonUtils.Deserialize<User>(responseBody)!;
                    return new WithRawResponse<User>
                    {
                        Data = data,
                        RawResponse = new RawResponse
                        {
                            StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                            Url = response.Raw.RequestMessage?.RequestUri!,
                            Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                        },
                    };
                }
                catch (JsonException e)
                {
                    throw new SeedMultiLineDocsException("Failed to deserialize response", e);
                }
            }

            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedMultiLineDocsApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }
    }
}

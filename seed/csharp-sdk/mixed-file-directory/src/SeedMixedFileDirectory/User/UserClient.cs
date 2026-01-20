using System.Text.Json;
using SeedMixedFileDirectory.Core;
using SeedMixedFileDirectory.User_;

namespace SeedMixedFileDirectory;

public partial class UserClient : IUserClient
{
    private RawClient _client;

    internal UserClient(RawClient client)
    {
        _client = client;
        Events = new EventsClient(_client);
        Raw = new WithRawResponseClient(_client);
    }

    public EventsClient Events { get; }

    public UserClient.WithRawResponseClient Raw { get; }

    /// <summary>
    /// List all users.
    /// </summary>
    /// <example><code>
    /// await client.User.ListAsync(new ListUsersRequest { Limit = 1 });
    /// </code></example>
    public async Task<IEnumerable<User>> ListAsync(
        ListUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.ListAsync(request, options, cancellationToken);
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
        /// List all users.
        /// </summary>
        public async Task<WithRawResponse<IEnumerable<User>>> ListAsync(
            ListUsersRequest request,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var _query = new Dictionary<string, object>();
            if (request.Limit != null)
            {
                _query["limit"] = request.Limit.Value.ToString();
            }
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.BaseUrl,
                        Method = HttpMethod.Get,
                        Path = "/users/",
                        Query = _query,
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
                    var data = JsonUtils.Deserialize<IEnumerable<User>>(responseBody)!;
                    return new WithRawResponse<IEnumerable<User>>
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
                    throw new SeedMixedFileDirectoryException("Failed to deserialize response", e);
                }
            }

            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedMixedFileDirectoryApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }
    }
}

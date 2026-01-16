using SeedPublicObject.Core;

namespace SeedPublicObject;

public partial class ServiceClient : IServiceClient
{
    private RawClient _client;

    internal ServiceClient(RawClient client)
    {
        _client = client;
        Raw = new RawAccessClient(_client);
    }

    public ServiceClient.RawAccessClient Raw { get; }

    public async Task<System.IO.Stream> GetAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.GetAsync(options, cancellationToken);
        return response.Data;
    }

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }

        public async Task<WithRawResponse<System.IO.Stream>> GetAsync(
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
                        Path = "/helloworld.txt",
                        Options = options,
                    },
                    cancellationToken
                )
                .ConfigureAwait(false);
            // File download responses are not supported for raw access
            throw new SeedPublicObjectException(
                "File download responses are not supported for raw access"
            );
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedPublicObjectApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }
    }
}

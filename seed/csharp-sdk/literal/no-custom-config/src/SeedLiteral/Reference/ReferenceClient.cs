using System.Text.Json;
using SeedLiteral.Core;

namespace SeedLiteral;

public partial class ReferenceClient : IReferenceClient
{
    private RawClient _client;

    internal ReferenceClient(RawClient client)
    {
        _client = client;
        Raw = new WithRawResponseClient(_client);
    }

    public ReferenceClient.WithRawResponseClient Raw { get; }

    /// <example><code>
    /// await client.Reference.SendAsync(
    ///     new SendRequest
    ///     {
    ///         Prompt = "You are a helpful assistant",
    ///         Stream = false,
    ///         Context = "You're super wise",
    ///         Query = "What is the weather today",
    ///         ContainerObject = new ContainerObject
    ///         {
    ///             NestedObjects = new List&lt;NestedObjectWithLiterals&gt;()
    ///             {
    ///                 new NestedObjectWithLiterals
    ///                 {
    ///                     Literal1 = "literal1",
    ///                     Literal2 = "literal2",
    ///                     StrProp = "strProp",
    ///                 },
    ///             },
    ///         },
    ///     }
    /// );
    /// </code></example>
    public async Task<SendResponse> SendAsync(
        SendRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.SendAsync(request, options, cancellationToken);
        return response.Data;
    }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }

        public async Task<WithRawResponse<SendResponse>> SendAsync(
            SendRequest request,
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
                        Path = "reference",
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
                    var data = JsonUtils.Deserialize<SendResponse>(responseBody)!;
                    return new WithRawResponse<SendResponse>
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
                    throw new SeedLiteralException("Failed to deserialize response", e);
                }
            }

            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedLiteralApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }
    }
}

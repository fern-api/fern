using global::System.Text.Json;
using SeedCsharpPathParamOrder.Core;

namespace SeedCsharpPathParamOrder;

public partial class SeedCsharpPathParamOrderClient : ISeedCsharpPathParamOrderClient
{
    private readonly RawClient _client;

    public SeedCsharpPathParamOrderClient(ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedCsharpPathParamOrder" },
                { "X-Fern-SDK-Version", global::SeedCsharpPathParamOrder.Version.Current },
                { "User-Agent", "Ferncsharp-path-param-order/0.0.1" },
            }
        );
        foreach (var header in platformHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        _client = new RawClient(clientOptions);
    }

    private async Task<WithRawResponse<string>> SetApprovedBillAsyncCore(
        int idBill,
        string approved,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedCsharpPathParamOrder.Core.QueryStringBuilder.Builder(capacity: 0)
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var _headers = await new SeedCsharpPathParamOrder.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Get,
                    Path = string.Format(
                        "Bill/approval/{0}/{1}",
                        ValueConvert.ToPathParameterString(idBill),
                        ValueConvert.ToPathParameterString(approved)
                    ),
                    QueryString = _queryString,
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            try
            {
                var responseData = JsonUtils.Deserialize<string>(responseBody)!;
                return new WithRawResponse<string>()
                {
                    Data = responseData,
                    RawResponse = new SeedCsharpPathParamOrder.RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedCsharpPathParamOrderApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e,
                    rawResponse: new SeedCsharpPathParamOrder.RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    }
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedCsharpPathParamOrderApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody,
                rawResponse: new SeedCsharpPathParamOrder.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                }
            );
        }
    }

    /// <summary>
    /// Endpoint whose URL lists `idBill` (int) before `approved` (string), but whose
    /// example authors the path-parameters in the reverse order. The generated client
    /// method signature follows URL order, so the test/example writer must bind each
    /// example value to its parameter by name rather than positionally. Otherwise the
    /// arguments are swapped and the C# fails to compile (CS1503).
    /// </summary>
    /// <example><code>
    /// await client.SetApprovedBillAsync(285, "true");
    /// </code></example>
    public WithRawResponseTask<string> SetApprovedBillAsync(
        int idBill,
        string approved,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<string>(
            SetApprovedBillAsyncCore(idBill, approved, options, cancellationToken)
        );
    }
}

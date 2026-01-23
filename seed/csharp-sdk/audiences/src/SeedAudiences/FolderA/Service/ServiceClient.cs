using System.Text.Json;
using SeedAudiences;
using SeedAudiences.Core;

namespace SeedAudiences.FolderA;

public partial class ServiceClient : IServiceClient
{
    private RawClient _client;

    internal ServiceClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<Response>> GetDirectThreadAsyncCore(
        GetDirectThreadRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryBuilder = new SeedAudiences.Core.QueryStringBuilder.Builder(capacity: 2)
            .Add("ids", request.Ids)
            .Add("tags", request.Tags);
        var _queryString = _queryBuilder
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "",
                    QueryString = _queryString,
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
                var responseData = JsonUtils.Deserialize<Response>(responseBody)!;
                return new WithRawResponse<Response>()
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
                throw new SeedAudiencesApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedAudiencesApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.FolderA.Service.GetDirectThreadAsync(
    ///     new GetDirectThreadRequest { Ids = ["ids"], Tags = ["tags"] }
    /// );
    /// </code></example>
    public WithRawResponseTask<Response> GetDirectThreadAsync(
        GetDirectThreadRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<Response>(
            GetDirectThreadAsyncCore(request, options, cancellationToken)
        );
    }
}

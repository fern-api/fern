using System.Text.Json;
using SeedPagination.Core;

namespace SeedPagination;

public partial class RawComplexClient
{
    private RawClient _client;

    internal RawComplexClient(RawClient client)
    {
        _client = client;
    }

    public async Task<RawResponse<PaginatedConversationResponse>> SearchAsync(
        string index,
        SearchRequest request,
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
                    Path = string.Format(
                        "{0}/conversations/search",
                        ValueConvert.ToPathParameterString(index)
                    ),
                    Body = request,
                    ContentType = "application/json",
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
                var body = JsonUtils.Deserialize<PaginatedConversationResponse>(responseBody)!;
                return new RawResponse<PaginatedConversationResponse>
                {
                    Body = body,
                    StatusCode = response.StatusCode,
                    Headers = response.Raw.Headers,
                };
            }
            catch (JsonException e)
            {
                throw new SeedPaginationException("Failed to deserialize response", e);
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedPaginationApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}

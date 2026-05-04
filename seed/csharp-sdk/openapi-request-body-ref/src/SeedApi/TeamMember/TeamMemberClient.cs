using global::System.Text.Json;
using SeedApi.Core;

namespace SeedApi;

public partial class TeamMemberClient : ITeamMemberClient
{
    private readonly RawClient _client;

    internal TeamMemberClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<TeamMember>> UpdateTeamMemberAsyncCore(
        UpdateTeamMemberRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Put,
                    Path = string.Format(
                        "team-members/{0}",
                        ValueConvert.ToPathParameterString(request.TeamMemberId)
                    ),
                    Body = request,
                    Headers = _headers,
                    ContentType = "application/json",
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
                var responseData = JsonUtils.Deserialize<TeamMember>(responseBody)!;
                return new WithRawResponse<TeamMember>()
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
                throw new SeedApiApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.TeamMember.UpdateTeamMemberAsync(
    ///     new UpdateTeamMemberRequest { TeamMemberId = "team_member_id" }
    /// );
    /// </code></example>
    public WithRawResponseTask<TeamMember> UpdateTeamMemberAsync(
        UpdateTeamMemberRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TeamMember>(
            UpdateTeamMemberAsyncCore(request, options, cancellationToken)
        );
    }
}

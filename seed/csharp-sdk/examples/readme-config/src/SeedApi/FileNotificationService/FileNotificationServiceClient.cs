using global::System.Text.Json;
using OneOf;
using SeedApi.Core;

namespace SeedApi;

public partial class FileNotificationServiceClient : IFileNotificationServiceClient
{
    private readonly RawClient _client;

    internal FileNotificationServiceClient(RawClient client)
    {
        _client = client;
    }

    private async Task<
        WithRawResponse<OneOf<ExceptionZero, ExceptionType>>
    > FileNotificationServiceGetExceptionAsyncCore(
        FileNotificationServiceGetExceptionRequest request,
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
                    Method = HttpMethod.Get,
                    Path = string.Format(
                        "file/notification/{0}",
                        ValueConvert.ToPathParameterString(request.NotificationId)
                    ),
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
                var responseData = JsonUtils.Deserialize<OneOf<ExceptionZero, ExceptionType>>(
                    responseBody
                )!;
                return new WithRawResponse<OneOf<ExceptionZero, ExceptionType>>()
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
    /// await client.FileNotificationService.FileNotificationServiceGetExceptionAsync(
    ///     new FileNotificationServiceGetExceptionRequest { NotificationId = "notificationId" }
    /// );
    /// </code></example>
    public WithRawResponseTask<
        OneOf<ExceptionZero, ExceptionType>
    > FileNotificationServiceGetExceptionAsync(
        FileNotificationServiceGetExceptionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<OneOf<ExceptionZero, ExceptionType>>(
            FileNotificationServiceGetExceptionAsyncCore(request, options, cancellationToken)
        );
    }
}

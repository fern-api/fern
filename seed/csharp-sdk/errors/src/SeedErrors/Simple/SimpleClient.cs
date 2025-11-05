using System.Text.Json;
using SeedErrors.Core;

namespace SeedErrors;

public partial class SimpleClient
{
    private RawClient _client;

    internal SimpleClient(RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.Simple.FooWithoutEndpointErrorAsync(new FooRequest { Bar = "bar" });
    /// </code></example>
    public async Task<FooResponse> FooWithoutEndpointErrorAsync(
        FooRequest request,
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
                    Path = "foo1",
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
                return JsonUtils.Deserialize<FooResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedErrorsException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                switch (response.StatusCode)
                {
                    case 404:
                        throw new NotFoundError(JsonUtils.Deserialize<ErrorBody>(responseBody));
                    case 400:
                        throw new BadRequestError(JsonUtils.Deserialize<ErrorBody>(responseBody));
                    case 500:
                        throw new InternalServerError(
                            JsonUtils.Deserialize<ErrorBody>(responseBody)
                        );
                }
            }
            catch (JsonException)
            {
                // unable to map error response, throwing generic error
            }
            throw new SeedErrorsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Simple.FooAsync(new FooRequest { Bar = "bar" });
    /// </code></example>
    public async Task<FooResponse> FooAsync(
        FooRequest request,
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
                    Path = "foo2",
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
                return JsonUtils.Deserialize<FooResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedErrorsException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                switch (response.StatusCode)
                {
                    case 429:
                        throw new FooTooMuch(JsonUtils.Deserialize<ErrorBody>(responseBody));
                    case 500:
                        throw new FooTooLittle(JsonUtils.Deserialize<ErrorBody>(responseBody));
                    case 404:
                        throw new NotFoundError(JsonUtils.Deserialize<ErrorBody>(responseBody));
                    case 400:
                        throw new BadRequestError(JsonUtils.Deserialize<ErrorBody>(responseBody));
                }
            }
            catch (JsonException)
            {
                // unable to map error response, throwing generic error
            }
            throw new SeedErrorsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Simple.FooWithExamplesAsync(new FooRequest { Bar = "hello" });
    /// </code></example>
    public async Task<FooResponse> FooWithExamplesAsync(
        FooRequest request,
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
                    Path = "foo3",
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
                return JsonUtils.Deserialize<FooResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedErrorsException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                switch (response.StatusCode)
                {
                    case 429:
                        throw new FooTooMuch(JsonUtils.Deserialize<ErrorBody>(responseBody));
                    case 500:
                        throw new FooTooLittle(JsonUtils.Deserialize<ErrorBody>(responseBody));
                    case 404:
                        throw new NotFoundError(JsonUtils.Deserialize<ErrorBody>(responseBody));
                    case 400:
                        throw new BadRequestError(JsonUtils.Deserialize<ErrorBody>(responseBody));
                }
            }
            catch (JsonException)
            {
                // unable to map error response, throwing generic error
            }
            throw new SeedErrorsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}

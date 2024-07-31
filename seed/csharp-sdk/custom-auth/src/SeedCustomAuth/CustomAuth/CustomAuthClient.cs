using System.Net.Http;
using System.Text.Json;
using SeedCustomAuth;
using SeedCustomAuth.Core;

#nullable enable

namespace SeedCustomAuth;

public class CustomAuthClient
{
    private RawClient _client;

    public CustomAuthClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// GET request with custom auth scheme
    /// </summary>
    public async Task<bool> GetWithCustomAuthAsync()
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "custom-auth"
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<bool>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedCustomAuthException("Failed to deserialize response", e);
            }
        }

        try
        {
            switch (response.StatusCode)
            {
                case 401:
                    throw new UnauthorizedRequest(
                        JsonUtils.Deserialize<UnauthorizedRequestErrorBody>(responseBody)
                    );
            }
        }
        catch (JsonException e)
        {
            // unable to map error response, throwing generic error
        }
        throw new SeedCustomAuthApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }

    /// <summary>
    /// POST request with custom auth scheme
    /// </summary>
    public async Task<bool> PostWithCustomAuthAsync(object request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "custom-auth",
                Body = request
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<bool>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedCustomAuthException("Failed to deserialize response", e);
            }
        }

        try
        {
            switch (response.StatusCode)
            {
                case 401:
                    throw new UnauthorizedRequest(
                        JsonUtils.Deserialize<UnauthorizedRequestErrorBody>(responseBody)
                    );
                case 400:
                    throw new BadRequest(JsonUtils.Deserialize<object>(responseBody));
            }
        }
        catch (JsonException e)
        {
            // unable to map error response, throwing generic error
        }
        throw new SeedCustomAuthApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }
}

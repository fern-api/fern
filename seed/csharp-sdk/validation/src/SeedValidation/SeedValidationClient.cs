using System;
using System.Net.Http;
using System.Text.Json;
using SeedValidation;
using SeedValidation.Core;

#nullable enable

namespace SeedValidation;

public partial class SeedValidationClient
{
    private RawClient _client;

    public SeedValidationClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
    }

    public async Task<Type> CreateAsync(CreateRequest request, RequestOptions? options = null)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "/create",
                Body = request,
                Options = options
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<Type>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedValidationException("Failed to deserialize response", e);
            }
        }

        throw new SeedValidationApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }

    public async Task<Type> GetAsync(GetRequest request, RequestOptions? options = null)
    {
        var _query = new Dictionary<string, object>() { };
        _query["decimal"] = request.Decimal.ToString();
        _query["even"] = request.Even.ToString();
        _query["name"] = request.Name;
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "",
                Query = _query,
                Options = options
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<Type>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedValidationException("Failed to deserialize response", e);
            }
        }

        throw new SeedValidationApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }
}

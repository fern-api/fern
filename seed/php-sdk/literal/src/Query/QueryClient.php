<?php

namespace Seed\Query;

use GuzzleHttp\ClientInterface;
use Seed\Core\Client\RawClient;
use Seed\Query\Requests\SendLiteralsInQueryRequest;
use Seed\Types\SendResponse;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\Json\JsonApiRequest;
use Seed\Core\Client\HttpMethod;
use JsonException;
use GuzzleHttp\Exception\RequestException;
use Psr\Http\Client\ClientExceptionInterface;

class QueryClient 
{
    /**
     * @var array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options @phpstan-ignore-next-line Property is used in endpoint methods via HttpEndpointGenerator
     */
    private array $options;

    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @param RawClient $client
     * @param ?array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options
     */
    function __construct(
        RawClient $client,
        ?array $options = null,
    )
    {
        $this->client = $client;
        $this->options = $options ?? [];
    }

    /**
     * @param SendLiteralsInQueryRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return SendResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    public function send(SendLiteralsInQueryRequest $request, ?array $options = null): SendResponse {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        $query['prompt'] = 'You are a helpful assistant';
        $query['alias_prompt'] = $request->aliasPrompt;
        $query['query'] = $request->query;
        $query['stream'] = 'false';
        $query['alias_stream'] = $request->aliasStream;
        if ($request->optionalPrompt != null){
            $query['optional_prompt'] = $request->optionalPrompt;
        }
        if ($request->aliasOptionalPrompt != null){
            $query['alias_optional_prompt'] = $request->aliasOptionalPrompt;
        }
        if ($request->optionalStream != null){
            $query['optional_stream'] = $request->optionalStream;
        }
        if ($request->aliasOptionalStream != null){
            $query['alias_optional_stream'] = $request->aliasOptionalStream;
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "query",
                    method: HttpMethod::POST,
                    query: $query,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400){
                $json = $response->getBody()->getContents();
                return SendResponse::fromJson($json);
            }
            } catch (JsonException $e) {
                throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
        } catch (RequestException $e) {
            $response = $e->getResponse();
            if ($response === null){
                throw new SeedException(message: $e->getMessage(), previous: $e);
            }
            throw new SeedApiException(
                message: "API request failed",
                statusCode: $response->getStatusCode(),
                body: $response->getBody()->getContents(),
            );
        } catch (ClientExceptionInterface $e) {
            throw new SeedException(message: $e->getMessage(), previous: $e);
        }
        throw new SeedApiException(
            message: 'API request failed',
            statusCode: $statusCode,
            body: $response->getBody()->getContents(),
        );
    }
}

<?php

namespace Seed\Complex;

use GuzzleHttp\ClientInterface;
use Seed\Core\Client\RawClient;
use Seed\Complex\Types\SearchRequest;
use Seed\Core\Pagination\Pager;
use Seed\Complex\Types\Conversation;
use Seed\Core\Pagination\CursorPager;
use Seed\Core\Pagination\PaginationHelper;
use Seed\Complex\Types\PaginatedConversationResponse;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\Json\JsonApiRequest;
use Seed\Core\Client\HttpMethod;
use JsonException;
use GuzzleHttp\Exception\RequestException;
use Psr\Http\Client\ClientExceptionInterface;

class ComplexClient 
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
     * @param string $index
     * @param SearchRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return Pager<Conversation>
     */
    public function search(string $index, SearchRequest $request, ?array $options = null): Pager {
        return new CursorPager(
            request: $request,
            getNextPage: fn(SearchRequest $request) => $this->_search($index, $request, $options),
            setCursor: function (SearchRequest $request, ?string $cursor) { 
                PaginationHelper::setDeep($request, ["pagination", "startingAfter"], $cursor);
            },
            /* @phpstan-ignore-next-line */
            getNextCursor: fn (PaginatedConversationResponse $response) => $response?->getPages()?->getNext()?->getStartingAfter() ?? null,
            /* @phpstan-ignore-next-line */
            getItems: fn (PaginatedConversationResponse $response) => $response?->getConversations() ?? [],
        );
    }

    /**
     * @param string $index
     * @param SearchRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return PaginatedConversationResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    private function _search(string $index, SearchRequest $request, ?array $options = null): PaginatedConversationResponse {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "{$index}/conversations/search",
                    method: HttpMethod::POST,
                    body: $request,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400){
                $json = $response->getBody()->getContents();
                return PaginatedConversationResponse::fromJson($json);
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

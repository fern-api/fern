<?php

namespace Seed\Endpoints\Pagination;

use Psr\Http\Client\ClientInterface;
use Seed\Core\Client\RawClient;
use Seed\Endpoints\Pagination\Requests\ListItemsRequest;
use Seed\Core\Pagination\Pager;
use Seed\Types\Object\Types\ObjectWithRequiredField;
use Seed\Core\Pagination\CursorPager;
use Seed\Endpoints\Pagination\Types\PaginatedResponse;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\Json\JsonApiRequest;
use Seed\Core\Client\HttpMethod;
use JsonException;
use Psr\Http\Client\ClientExceptionInterface;

class PaginationClient
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
    public function __construct(
        RawClient $client,
        ?array $options = null,
    ) {
        $this->client = $client;
        $this->options = $options ?? [];
    }

    /**
     * List items with cursor pagination
     *
     * @param ListItemsRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return Pager<ObjectWithRequiredField>
     */
    public function listItems(ListItemsRequest $request = new ListItemsRequest(), ?array $options = null): Pager
    {
        return new CursorPager(
            request: $request,
            getNextPage: fn (ListItemsRequest $request) => $this->_listItems($request, $options),
            setCursor: function (ListItemsRequest $request, ?string $cursor) {
                $request->cursor = $cursor;
            },
            /* @phpstan-ignore-next-line */
            getNextCursor: fn (PaginatedResponse $response) => $response?->next ?? null,
            /* @phpstan-ignore-next-line */
            getItems: fn (PaginatedResponse $response) => $response?->items ?? [],
        );
    }

    /**
     * List items with cursor pagination
     *
     * @param ListItemsRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return PaginatedResponse
     * @throws SeedException
     * @throws SeedApiException
     */
    private function _listItems(ListItemsRequest $request = new ListItemsRequest(), ?array $options = null): PaginatedResponse
    {
        $options = array_merge($this->options, $options ?? []);
        $query = [];
        if ($request->cursor != null) {
            $query['cursor'] = $request->cursor;
        }
        if ($request->limit != null) {
            $query['limit'] = $request->limit;
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/pagination",
                    method: HttpMethod::GET,
                    query: $query,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                if (empty($json)) {
                    throw new SeedException(message: "Expected a JSON response body, but received an empty response.");
                }
                return PaginatedResponse::fromJson($json);
            }
        } catch (JsonException $e) {
            throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
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

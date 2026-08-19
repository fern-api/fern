<?php

namespace Seed\Core\Pagination;

use Generator;

/**
 * Custom pagination implementation for PHP SDK.
 *
 * This class is designed to be extended by SDK users to implement their own
 * pagination logic. The generator will use this class when custom pagination
 * is specified in the API definition.
 *
 * Users should:
 * 1. Extend this class in their codebase
 * 2. Override the getPages() method to implement their pagination logic
 * 3. Use the provided response and client to fetch subsequent pages
 *
 * @template TResponse
 * @template TItem
 * @extends Pager<TItem>
 */
class CustomPager extends Pager
{
    /** @var TResponse */
    protected $response;

    /** @var mixed */
    protected $client;

    /**
     * @param TResponse $response The initial response from the API
     * @param mixed $client The client instance for making subsequent requests
     */
    public function __construct(
        $response,
        $client
    ) {
        $this->response = $response;
        $this->client = $client;
    }

    /**
     * Gets the initial response.
     *
     * @return TResponse
     */
    public function getResponse()
    {
        return $this->response;
    }

    /**
     * Gets the client instance for making subsequent requests.
     *
     * @return mixed
     */
    public function getClient()
    {
        return $this->client;
    }

    /**
     * Enumerate the values a Page at a time. This may make multiple service requests.
     *
     * Override this method to implement your custom pagination logic.
     *
     * Example implementation:
     * ```php
     * public function getPages(): Generator
     * {
     *     $response = $this->response;
     *     do {
     *         $items = $response->getData();
     *         if ($items !== null) {
     *             yield new Page($items);
     *         }
     *
     *         $nextCursor = $response->getNextCursor();
     *         if ($nextCursor === null) {
     *             break;
     *         }
     *
     *         $response = $this->client->list(['cursor' => $nextCursor]);
     *     } while (true);
     * }
     * ```
     *
     * @return Generator<int, Page<TItem>>
     */
    public function getPages(): Generator
    {
        throw new \RuntimeException(
            'CustomPager::getPages() must be implemented. ' .
            'Please extend this class and override the getPages() method to define your pagination logic.'
        );
    }
}

<?php

namespace Seed\Core\Client;

use Psr\Http\Client\ClientInterface;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use RuntimeException;

class MockHttpClient implements ClientInterface, \Countable
{
    /**
     * @var array<ResponseInterface>
     */
    private array $responses = [];

    /**
     * @var array<RequestInterface>
     */
    private array $requests = [];

    /**
     * @param ResponseInterface ...$responses
     */
    public function append(ResponseInterface ...$responses): void
    {
        foreach ($responses as $response) {
            $this->responses[] = $response;
        }
    }

    /**
     * @param RequestInterface $request
     * @return ResponseInterface
     */
    public function sendRequest(RequestInterface $request): ResponseInterface
    {
        $this->requests[] = $request;

        if (empty($this->responses)) {
            throw new RuntimeException('No more responses in the queue. Add responses using append().');
        }

        return array_shift($this->responses);
    }

    /**
     * @return ?RequestInterface
     */
    public function getLastRequest(): ?RequestInterface
    {
        if (empty($this->requests)) {
            return null;
        }
        return $this->requests[count($this->requests) - 1];
    }

    /**
     * @return int
     */
    public function getRequestCount(): int
    {
        return count($this->requests);
    }

    /**
     * Returns the number of remaining responses in the queue.
     *
     * @return int
     */
    public function count(): int
    {
        return count($this->responses);
    }
}

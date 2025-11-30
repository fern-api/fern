<?php

namespace Seed\Core\Client;

abstract class BaseApiRequest
{
    /**
     * @param string $baseUrl The base URL for the request
     * @param string $path The path for the request
     * @param HttpMethod $method The HTTP method for the request
     * @param array<string, string> $headers Additional headers for the request (optional)
     * @param array<string, mixed> $query Query parameters for the request (optional)
     */
    public function __construct(
        public readonly string      $baseUrl,
        public readonly string      $path,
        public readonly HttpMethod  $method,
        public readonly array       $headers = [],
        public readonly array       $query = [],
    ) {
    }
}
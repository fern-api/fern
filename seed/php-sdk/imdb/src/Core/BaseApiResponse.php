<?php

namespace Seed\Core;

use Psr\Http\Message\ResponseInterface;

class BaseApiResponse
{
    /**
     * @param int $statusCode The status code of the response.
     * @param ResponseInterface $raw The raw HTTP response.
     */
    public function __construct(
        public readonly int               $statusCode,
        public readonly ResponseInterface $raw,
    )
    {
    }
}
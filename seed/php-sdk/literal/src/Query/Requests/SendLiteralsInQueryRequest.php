<?php

namespace Seed\Query\Requests;

class SendLiteralsInQueryRequest
{
    /**
     * @var string $prompt
     */
    public string $prompt;

    /**
     * @var string $query
     */
    public string $query;

    /**
     * @var bool $stream
     */
    public bool $stream;

    /**
     * @param string $prompt
     * @param string $query
     * @param bool $stream
     */
    public function __construct(
        string $prompt,
        string $query,
        bool $stream,
    ) {
        $this->prompt = $prompt;
        $this->query = $query;
        $this->stream = $stream;
    }
}

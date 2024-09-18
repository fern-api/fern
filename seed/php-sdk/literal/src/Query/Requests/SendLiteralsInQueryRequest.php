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

}

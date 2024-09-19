<?php

namespace Seed\Reference;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class SendRequest extends SerializableType
{
    /**
     * @var string $prompt
     */
    #[JsonProperty("prompt")]
    public string $prompt;

    /**
     * @var string $query
     */
    #[JsonProperty("query")]
    public string $query;

    /**
     * @var bool $stream
     */
    #[JsonProperty("stream")]
    public bool $stream;

    /**
     * @var string $context
     */
    #[JsonProperty("context")]
    public string $context;

    /**
     * @var ?string $maybeContext
     */
    #[JsonProperty("maybeContext")]
    public ?string $maybeContext;

    /**
     * @param string $prompt
     * @param string $query
     * @param bool $stream
     * @param string $context
     * @param ?string $maybeContext
     */
    public function __construct(
        string $prompt,
        string $query,
        bool $stream,
        string $context,
        ?string $maybeContext = null,
    ) {
        $this->prompt = $prompt;
        $this->query = $query;
        $this->stream = $stream;
        $this->context = $context;
        $this->maybeContext = $maybeContext;
    }
}

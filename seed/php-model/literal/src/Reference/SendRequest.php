<?php

namespace Seed\Reference;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class SendRequest extends SerializableType
{
    #[JsonProperty("prompt")]
    /**
     * @var string $prompt
     */
    public string $prompt;

    #[JsonProperty("query")]
    /**
     * @var string $query
     */
    public string $query;

    #[JsonProperty("stream")]
    /**
     * @var bool $stream
     */
    public bool $stream;

    #[JsonProperty("context")]
    /**
     * @var string $context
     */
    public string $context;

    #[JsonProperty("maybeContext")]
    /**
     * @var ?string $maybeContext
     */
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

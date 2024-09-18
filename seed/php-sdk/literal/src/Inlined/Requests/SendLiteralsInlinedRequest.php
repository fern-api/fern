<?php

namespace Seed\Inlined\Requests;

use Seed\Core\JsonProperty;
use Seed\Inlined\Types\ATopLevelLiteral;

class SendLiteralsInlinedRequest
{
    /**
     * @var string $prompt
     */
    #[JsonProperty("prompt")]
    public string $prompt;

    /**
     * @var ?string $context
     */
    #[JsonProperty("context")]
    public ?string $context;

    /**
     * @var string $query
     */
    #[JsonProperty("query")]
    public string $query;

    /**
     * @var ?float $temperature
     */
    #[JsonProperty("temperature")]
    public ?float $temperature;

    /**
     * @var bool $stream
     */
    #[JsonProperty("stream")]
    public bool $stream;

    /**
     * @var string $aliasedContext
     */
    #[JsonProperty("aliasedContext")]
    public string $aliasedContext;

    /**
     * @var ?string $maybeContext
     */
    #[JsonProperty("maybeContext")]
    public ?string $maybeContext;

    /**
     * @var ATopLevelLiteral $objectWithLiteral
     */
    #[JsonProperty("objectWithLiteral")]
    public ATopLevelLiteral $objectWithLiteral;

}

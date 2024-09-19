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
     * @var string $aliasedContext
     */
    #[JsonProperty("aliasedContext")]
    public string $aliasedContext;

    /**
     * @var ATopLevelLiteral $objectWithLiteral
     */
    #[JsonProperty("objectWithLiteral")]
    public ATopLevelLiteral $objectWithLiteral;

    /**
     * @var ?string $context
     */
    #[JsonProperty("context")]
    public ?string $context;

    /**
     * @var ?float $temperature
     */
    #[JsonProperty("temperature")]
    public ?float $temperature;

    /**
     * @var ?string $maybeContext
     */
    #[JsonProperty("maybeContext")]
    public ?string $maybeContext;

    /**
     * @param string $prompt
     * @param string $query
     * @param bool $stream
     * @param string $aliasedContext
     * @param ATopLevelLiteral $objectWithLiteral
     * @param ?string $context
     * @param ?float $temperature
     * @param ?string $maybeContext
     */
    public function __construct(
        string $prompt,
        string $query,
        bool $stream,
        string $aliasedContext,
        ATopLevelLiteral $objectWithLiteral,
        ?string $context = null,
        ?float $temperature = null,
        ?string $maybeContext = null,
    ) {
        $this->prompt = $prompt;
        $this->query = $query;
        $this->stream = $stream;
        $this->aliasedContext = $aliasedContext;
        $this->objectWithLiteral = $objectWithLiteral;
        $this->context = $context;
        $this->temperature = $temperature;
        $this->maybeContext = $maybeContext;
    }
}

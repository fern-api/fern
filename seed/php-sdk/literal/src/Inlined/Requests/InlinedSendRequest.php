<?php

namespace Seed\Inlined\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Inlined\Types\InlinedSendRequestPrompt;
use Seed\Core\Json\JsonProperty;
use Seed\Inlined\Types\InlinedSendRequestContext;
use Seed\Types\SomeAliasedLiteral;
use Seed\Types\ATopLevelLiteral;

class InlinedSendRequest extends JsonSerializableType
{
    /**
     * @var value-of<InlinedSendRequestPrompt> $prompt
     */
    #[JsonProperty('prompt')]
    public string $prompt;

    /**
     * @var ?value-of<InlinedSendRequestContext> $context
     */
    #[JsonProperty('context')]
    public ?string $context;

    /**
     * @var string $query
     */
    #[JsonProperty('query')]
    public string $query;

    /**
     * @var ?float $temperature
     */
    #[JsonProperty('temperature')]
    public ?float $temperature;

    /**
     * @var bool $stream
     */
    #[JsonProperty('stream')]
    public bool $stream;

    /**
     * @var value-of<SomeAliasedLiteral> $aliasedContext
     */
    #[JsonProperty('aliasedContext')]
    public string $aliasedContext;

    /**
     * @var ?value-of<SomeAliasedLiteral> $maybeContext
     */
    #[JsonProperty('maybeContext')]
    public ?string $maybeContext;

    /**
     * @var ATopLevelLiteral $objectWithLiteral
     */
    #[JsonProperty('objectWithLiteral')]
    public ATopLevelLiteral $objectWithLiteral;

    /**
     * @param array{
     *   prompt: value-of<InlinedSendRequestPrompt>,
     *   query: string,
     *   stream: bool,
     *   aliasedContext: value-of<SomeAliasedLiteral>,
     *   objectWithLiteral: ATopLevelLiteral,
     *   context?: ?value-of<InlinedSendRequestContext>,
     *   temperature?: ?float,
     *   maybeContext?: ?value-of<SomeAliasedLiteral>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->prompt = $values['prompt'];
        $this->context = $values['context'] ?? null;
        $this->query = $values['query'];
        $this->temperature = $values['temperature'] ?? null;
        $this->stream = $values['stream'];
        $this->aliasedContext = $values['aliasedContext'];
        $this->maybeContext = $values['maybeContext'] ?? null;
        $this->objectWithLiteral = $values['objectWithLiteral'];
    }
}

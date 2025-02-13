<?php

namespace Seed\Inlined\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Inlined\Types\ATopLevelLiteral;

class SendLiteralsInlinedRequest extends JsonSerializableType
{
    /**
     * @var string $prompt
     */
    #[JsonProperty('prompt')]
    public string $prompt;

    /**
     * @var ?string $context
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
     * @var string $aliasedContext
     */
    #[JsonProperty('aliasedContext')]
    public string $aliasedContext;

    /**
     * @var ?string $maybeContext
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
     *   prompt: string,
     *   query: string,
     *   stream: bool,
     *   aliasedContext: string,
     *   objectWithLiteral: ATopLevelLiteral,
     *   context?: ?string,
     *   temperature?: ?float,
     *   maybeContext?: ?string,
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

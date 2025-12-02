<?php

namespace Seed\Inlined\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Inlined\Types\ATopLevelLiteral;

class SendLiteralsInlinedRequest extends JsonSerializableType
{
    /**
     * @var 'You are a helpful assistant' $prompt
     */
    #[JsonProperty('prompt')]
    public string $prompt;

    /**
     * @var ?"You're super wise" $context
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
     * @var false $stream
     */
    #[JsonProperty('stream')]
    public bool $stream;

    /**
     * @var "You're super wise" $aliasedContext
     */
    #[JsonProperty('aliasedContext')]
    public string $aliasedContext;

    /**
     * @var ?"You're super wise" $maybeContext
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
     *   prompt: 'You are a helpful assistant',
     *   query: string,
     *   stream: false,
     *   aliasedContext: "You're super wise",
     *   objectWithLiteral: ATopLevelLiteral,
     *   context?: ?"You're super wise",
     *   temperature?: ?float,
     *   maybeContext?: ?"You're super wise",
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->prompt = $values['prompt'];$this->context = $values['context'] ?? null;$this->query = $values['query'];$this->temperature = $values['temperature'] ?? null;$this->stream = $values['stream'];$this->aliasedContext = $values['aliasedContext'];$this->maybeContext = $values['maybeContext'] ?? null;$this->objectWithLiteral = $values['objectWithLiteral'];
    }
}

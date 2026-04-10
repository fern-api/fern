<?php

namespace Seed\Reference\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Reference\Types\SendRequestPrompt;
use Seed\Core\Json\JsonProperty;
use Seed\Reference\Types\SendRequestEnding;
use Seed\Types\SomeLiteral;
use Seed\Types\ContainerObject;

class SendRequest extends JsonSerializableType
{
    /**
     * @var value-of<SendRequestPrompt> $prompt
     */
    #[JsonProperty('prompt')]
    public string $prompt;

    /**
     * @var string $query
     */
    #[JsonProperty('query')]
    public string $query;

    /**
     * @var bool $stream
     */
    #[JsonProperty('stream')]
    public bool $stream;

    /**
     * @var value-of<SendRequestEnding> $ending
     */
    #[JsonProperty('ending')]
    public string $ending;

    /**
     * @var value-of<SomeLiteral> $context
     */
    #[JsonProperty('context')]
    public string $context;

    /**
     * @var ?value-of<SomeLiteral> $maybeContext
     */
    #[JsonProperty('maybeContext')]
    public ?string $maybeContext;

    /**
     * @var ContainerObject $containerObject
     */
    #[JsonProperty('containerObject')]
    public ContainerObject $containerObject;

    /**
     * @param array{
     *   prompt: value-of<SendRequestPrompt>,
     *   query: string,
     *   stream: bool,
     *   ending: value-of<SendRequestEnding>,
     *   context: value-of<SomeLiteral>,
     *   containerObject: ContainerObject,
     *   maybeContext?: ?value-of<SomeLiteral>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->prompt = $values['prompt'];
        $this->query = $values['query'];
        $this->stream = $values['stream'];
        $this->ending = $values['ending'];
        $this->context = $values['context'];
        $this->maybeContext = $values['maybeContext'] ?? null;
        $this->containerObject = $values['containerObject'];
    }
}

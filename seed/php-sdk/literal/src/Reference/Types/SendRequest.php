<?php

namespace Seed\Reference\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class SendRequest extends JsonSerializableType
{
    /**
     * @var 'You are a helpful assistant' $prompt
     */
    #[JsonProperty('prompt')]
    public string $prompt;

    /**
     * @var string $query
     */
    #[JsonProperty('query')]
    public string $query;

    /**
     * @var false $stream
     */
    #[JsonProperty('stream')]
    public bool $stream;

    /**
     * @var '$ending' $ending
     */
    #[JsonProperty('ending')]
    public string $ending;

    /**
     * @var "You're super wise" $context
     */
    #[JsonProperty('context')]
    public string $context;

    /**
     * @var ?"You're super wise" $maybeContext
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
     *   query: string,
     *   containerObject: ContainerObject,
     *   maybeContext?: ?"You're super wise",
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->query = $values['query'];
        $this->maybeContext = $values['maybeContext'] ?? null;
        $this->containerObject = $values['containerObject'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}

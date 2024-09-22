<?php

namespace Seed\Commons\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class GenericValue extends SerializableType
{
    /**
     * @var ?string $stringifiedType
     */
    #[JsonProperty('stringifiedType')]
    public ?string $stringifiedType;

    /**
     * @var string $stringifiedValue
     */
    #[JsonProperty('stringifiedValue')]
    public string $stringifiedValue;

    /**
     * @param array{
     *   stringifiedType?: ?string,
     *   stringifiedValue: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->stringifiedType = $values['stringifiedType'] ?? null;
        $this->stringifiedValue = $values['stringifiedValue'];
    }
}

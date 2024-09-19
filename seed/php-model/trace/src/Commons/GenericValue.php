<?php

namespace Seed\Commons;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class GenericValue extends SerializableType
{
    /**
     * @var string $stringifiedValue
     */
    #[JsonProperty("stringifiedValue")]
    public string $stringifiedValue;

    /**
     * @var ?string $stringifiedType
     */
    #[JsonProperty("stringifiedType")]
    public ?string $stringifiedType;

    /**
     * @param string $stringifiedValue
     * @param ?string $stringifiedType
     */
    public function __construct(
        string $stringifiedValue,
        ?string $stringifiedType = null,
    ) {
        $this->stringifiedValue = $stringifiedValue;
        $this->stringifiedType = $stringifiedType;
    }
}

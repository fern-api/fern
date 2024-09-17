<?php

namespace Seed\Commons;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class ListType extends SerializableType
{
    #[JsonProperty("valueType")]
    /**
     * @var mixed $valueType
     */
    public mixed $valueType;

    #[JsonProperty("isFixedLength")]
    /**
     * @var ?bool $isFixedLength Whether this list is fixed-size (for languages that supports fixed-size lists). Defaults to false.
     */
    public ?bool $isFixedLength;

    /**
     * @param mixed $valueType
     * @param ?bool $isFixedLength Whether this list is fixed-size (for languages that supports fixed-size lists). Defaults to false.
     */
    public function __construct(
        mixed $valueType,
        ?bool $isFixedLength = null,
    ) {
        $this->valueType = $valueType;
        $this->isFixedLength = $isFixedLength;
    }
}

<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\PrimaryBlock;
use Seed\Core\Json\JsonProperty;

class BigUnionTwelve extends JsonSerializableType
{
    use PrimaryBlock;

    /**
     * @var value-of<BigUnionTwelveType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   value: string,
     *   type: value-of<BigUnionTwelveType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->value = $values['value'];
        $this->type = $values['type'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}

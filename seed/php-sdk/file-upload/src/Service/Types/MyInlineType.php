<?php

namespace Seed\Service\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class MyInlineType extends JsonSerializableType
{
    /**
     * @var string $bar
     */
    #[JsonProperty('bar')]
    public string $bar;

    /**
     * @param array{
     *   bar: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->bar = $values['bar'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}

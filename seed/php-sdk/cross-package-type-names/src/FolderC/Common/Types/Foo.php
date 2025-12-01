<?php

namespace Seed\FolderC\Common\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class Foo extends JsonSerializableType
{
    /**
     * @var string $barProperty
     */
    #[JsonProperty('bar_property')]
    public string $barProperty;

    /**
     * @param array{
     *   barProperty: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->barProperty = $values['barProperty'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}

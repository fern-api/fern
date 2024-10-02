<?php

namespace Seed\FolderC\Common;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class Foo extends SerializableType
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
    ) {
        $this->barProperty = $values['barProperty'];
    }
}

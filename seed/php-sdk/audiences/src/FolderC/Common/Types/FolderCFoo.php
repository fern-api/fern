<?php

namespace Seed\FolderC\Common\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class FolderCFoo extends SerializableType
{
    /**
     * @var string $barProperty
     */
    #[JsonProperty("bar_property")]
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

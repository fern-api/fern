<?php

namespace Seed\Types\Types;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class File extends SerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var string $contents
     */
    #[JsonProperty('contents')]
    public string $contents;

    /**
     * @param array{
     *   name: string,
     *   contents: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->name = $values['name'];
        $this->contents = $values['contents'];
    }
}

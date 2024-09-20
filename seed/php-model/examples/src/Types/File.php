<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

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

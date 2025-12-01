<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class Docs extends JsonSerializableType
{
    /**
     * @var string $docs
     */
    #[JsonProperty('docs')]
    public string $docs;

    /**
     * @param array{
     *   docs: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->docs = $values['docs'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}

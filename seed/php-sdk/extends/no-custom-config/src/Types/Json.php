<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\Docs;
use Seed\Core\Json\JsonProperty;

class Json extends JsonSerializableType
{
    use Docs;

    /**
     * @var string $raw
     */
    #[JsonProperty('raw')]
    public string $raw;

    /**
     * @param array{
     *   docs: string,
     *   raw: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->docs = $values['docs'];$this->raw = $values['raw'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}

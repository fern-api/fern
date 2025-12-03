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
    private string $docs;

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
    public function getDocs(): string {
        return $this->docs;}

    /**
     * @param string $value
     */
    public function setDocs(string $value): self {
        $this->docs = $value;return $this;}

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}

<?php

namespace Seed\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\ExampleType;
use Seed\Core\Json\JsonProperty;

class Inlined extends JsonSerializableType
{
    use ExampleType;

    /**
     * @var string $unique
     */
    #[JsonProperty('unique')]
    private string $unique;

    /**
     * @param array{
     *   unique: string,
     *   name: string,
     *   docs: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->unique = $values['unique'];$this->name = $values['name'];$this->docs = $values['docs'];
    }

    /**
     * @return string
     */
    public function getUnique(): string {
        return $this->unique;}

    /**
     * @param string $value
     */
    public function setUnique(string $value): self {
        $this->unique = $value;return $this;}
}

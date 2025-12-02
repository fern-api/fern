<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class Foo extends JsonSerializableType
{
    /**
     * @var string $normal
     */
    #[JsonProperty('normal')]
    public string $normal;

    /**
     * @var string $read
     */
    #[JsonProperty('read')]
    public string $read;

    /**
     * @var string $write
     */
    #[JsonProperty('write')]
    public string $write;

    /**
     * @param array{
     *   normal: string,
     *   read: string,
     *   write: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->normal = $values['normal'];$this->read = $values['read'];$this->write = $values['write'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}

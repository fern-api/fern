<?php

namespace Seed\Union;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class Request extends JsonSerializableType
{
    /**
     * @var (
     *    array<string, mixed>
     *   |NamedMetadata
     *   |null
     * ) $union
     */
    #[JsonProperty('union'), Union(new Union(['string' => 'mixed'], 'null'),NamedMetadata::class,'null')]
    public array|NamedMetadata|null $union;

    /**
     * @param array{
     *   union?: (
     *    array<string, mixed>
     *   |NamedMetadata
     *   |null
     * ),
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->union = $values['union'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}

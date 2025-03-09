<?php

namespace Seed\Nullable\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;

class User extends JsonSerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var string $id
     */
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var ?array<string> $tags
     */
    #[JsonProperty('tags'), ArrayType(['string'])]
    public ?array $tags;

    /**
     * @var ?Metadata $metadata
     */
    #[JsonProperty('metadata')]
    public ?Metadata $metadata;

    /**
     * @var ?string $email
     */
    #[JsonProperty('email')]
    public ?string $email;

    /**
     * @var (
     *    int
     *   |?float
     *   |float
     * ) $favoriteNumber
     */
    #[JsonProperty('favorite-number'), Union('integer',new Union('float', 'null'),'float')]
    public int|?float|float $favoriteNumber;

    /**
     * @param array{
     *   name: string,
     *   id: string,
     *   favoriteNumber: (
     *    int
     *   |?float
     *   |float
     * ),
     *   tags?: ?array<string>,
     *   metadata?: ?Metadata,
     *   email?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->name = $values['name'];$this->id = $values['id'];$this->tags = $values['tags'] ?? null;$this->metadata = $values['metadata'] ?? null;$this->email = $values['email'] ?? null;$this->favoriteNumber = $values['favoriteNumber'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}

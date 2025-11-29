<?php

namespace Seed\Nullable;

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
     *   |float
     *   |string
     *   |float
     *   |null
     * ) $favoriteNumber
     */
    #[JsonProperty('favorite-number'), Union('integer',new Union('float', 'null'),new Union('string', 'null'),'float')]
    public int|float|string|float|null $favoriteNumber;

    /**
     * @var ?array<int> $numbers
     */
    #[JsonProperty('numbers'), ArrayType(['integer'])]
    public ?array $numbers;

    /**
     * @var ?array<string, mixed> $strings
     */
    #[JsonProperty('strings'), ArrayType(['string' => 'mixed'])]
    public ?array $strings;

    /**
     * @param array{
     *   name: string,
     *   id: string,
     *   favoriteNumber: (
     *    int
     *   |float
     *   |string
     *   |float
     *   |null
     * ),
     *   tags?: ?array<string>,
     *   metadata?: ?Metadata,
     *   email?: ?string,
     *   numbers?: ?array<int>,
     *   strings?: ?array<string, mixed>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->name = $values['name'];$this->id = $values['id'];$this->tags = $values['tags'] ?? null;$this->metadata = $values['metadata'] ?? null;$this->email = $values['email'] ?? null;$this->favoriteNumber = $values['favoriteNumber'];$this->numbers = $values['numbers'] ?? null;$this->strings = $values['strings'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}

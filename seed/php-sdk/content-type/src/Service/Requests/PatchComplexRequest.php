<?php

namespace Seed\Service\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class PatchComplexRequest extends JsonSerializableType
{
    /**
     * @var ?string $name
     */
    #[JsonProperty('name')]
    public ?string $name;

    /**
     * @var ?string $email
     */
    #[JsonProperty('email')]
    public ?string $email;

    /**
     * @var ?int $age
     */
    #[JsonProperty('age')]
    public ?int $age;

    /**
     * @var ?bool $active
     */
    #[JsonProperty('active')]
    public ?bool $active;

    /**
     * @var ?array<string, mixed> $metadata
     */
    #[JsonProperty('metadata'), ArrayType(['string' => 'mixed'])]
    public ?array $metadata;

    /**
     * @var ?array<string> $tags
     */
    #[JsonProperty('tags'), ArrayType(['string'])]
    public ?array $tags;

    /**
     * @param array{
     *   name?: ?string,
     *   email?: ?string,
     *   age?: ?int,
     *   active?: ?bool,
     *   metadata?: ?array<string, mixed>,
     *   tags?: ?array<string>,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->name = $values['name'] ?? null;
        $this->email = $values['email'] ?? null;
        $this->age = $values['age'] ?? null;
        $this->active = $values['active'] ?? null;
        $this->metadata = $values['metadata'] ?? null;
        $this->tags = $values['tags'] ?? null;
    }
}

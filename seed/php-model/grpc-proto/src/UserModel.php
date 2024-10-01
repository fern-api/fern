<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\Union;

class UserModel extends SerializableType
{
    /**
     * @var ?string $username
     */
    #[JsonProperty('username')]
    public ?string $username;

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
     * @var ?float $weight
     */
    #[JsonProperty('weight')]
    public ?float $weight;

    /**
     * @var array<string, float|string|bool>|array<string, mixed>|null $metadata
     */
    #[JsonProperty('metadata'), Union(['string' => new Union('float', 'string', 'bool')], ['string' => 'mixed'])]
    public array|null $metadata;

    /**
     * @param array{
     *   username?: ?string,
     *   email?: ?string,
     *   age?: ?int,
     *   weight?: ?float,
     *   metadata?: array<string, float|string|bool>|array<string, mixed>|null,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->username = $values['username'] ?? null;
        $this->email = $values['email'] ?? null;
        $this->age = $values['age'] ?? null;
        $this->weight = $values['weight'] ?? null;
        $this->metadata = $values['metadata'] ?? null;
    }
}

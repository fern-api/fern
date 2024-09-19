<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class UserModel extends SerializableType
{
    /**
     * @var ?string $username
     */
    #[JsonProperty("username")]
    public ?string $username;

    /**
     * @var ?string $email
     */
    #[JsonProperty("email")]
    public ?string $email;

    /**
     * @var ?int $age
     */
    #[JsonProperty("age")]
    public ?int $age;

    /**
     * @var ?float $weight
     */
    #[JsonProperty("weight")]
    public ?float $weight;

    /**
     * @var mixed $metadata
     */
    #[JsonProperty("metadata")]
    public mixed $metadata;

    /**
     * @param array{
     *   username?: ?string,
     *   email?: ?string,
     *   age?: ?int,
     *   weight?: ?float,
     *   metadata: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->username = $values['username'] ?? null;
        $this->email = $values['email'] ?? null;
        $this->age = $values['age'] ?? null;
        $this->weight = $values['weight'] ?? null;
        $this->metadata = $values['metadata'];
    }
}

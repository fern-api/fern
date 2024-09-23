<?php

namespace Seed\User\Requests;

use Seed\Core\JsonProperty;

class CreateUserRequest
{
    /**
     * @var string $username
     */
    #[JsonProperty('username')]
    public string $username;

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
     * @param array{
     *   username: string,
     *   email?: ?string,
     *   age?: ?int,
     *   weight?: ?float,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->username = $values['username'];
        $this->email = $values['email'] ?? null;
        $this->age = $values['age'] ?? null;
        $this->weight = $values['weight'] ?? null;
    }
}

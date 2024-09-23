<?php

namespace Seed\User\Requests;

class GetUserRequest
{
    /**
     * @var ?string $username
     */
    public ?string $username;

    /**
     * @var ?int $age
     */
    public ?int $age;

    /**
     * @var ?float $weight
     */
    public ?float $weight;

    /**
     * @param array{
     *   username?: ?string,
     *   age?: ?int,
     *   weight?: ?float,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->username = $values['username'] ?? null;
        $this->age = $values['age'] ?? null;
        $this->weight = $values['weight'] ?? null;
    }
}

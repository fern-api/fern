<?php

namespace Seed\User;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

/**
* A user object. This type is used throughout the following APIs:
*
* - createUser
* - getUser
 */
class User extends SerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty("id")]
    public string $id;

    /**
     * @var string $name The user's name. This name is unique to each user. A few examples are included below:

    - Alice
    - Bob
    - Charlie
     */
    #[JsonProperty("name")]
    public string $name;

    /**
     * @var ?int $age The user's age.
     */
    #[JsonProperty("age")]
    public ?int $age;

    /**
     * @param array{
     *   id: string,
     *   name: string,
     *   age?: ?int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'];
        $this->name = $values['name'];
        $this->age = $values['age'] ?? null;
    }
}

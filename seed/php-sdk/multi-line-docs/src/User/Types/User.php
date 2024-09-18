<?php

namespace Seed\User\Types;

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
    #[JsonProperty("id")]
    /**
     * @var string $id
     */
    public string $id;

    #[JsonProperty("name")]
    /**
     * @var string $name The user's name. This name is unique to each user. A few examples are included below:

    - Alice
    - Bob
    - Charlie
     */
    public string $name;

    #[JsonProperty("age")]
    /**
     * @var ?int $age The user's age.
     */
    public ?int $age;

    /**
     * @param string $id
     * @param string $name The user's name. This name is unique to each user. A few examples are included below:

    - Alice
    - Bob
    - Charlie
     * @param ?int $age The user's age.
     */
    public function __construct(
        string $id,
        string $name,
        ?int $age = null,
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->age = $age;
    }
}

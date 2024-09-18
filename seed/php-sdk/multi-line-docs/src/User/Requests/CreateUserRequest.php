<?php

namespace Seed\User\Requests;

use Seed\Core\JsonProperty;

class CreateUserRequest
{
    /**
     * @var string $name The name of the user to create.
    This name is unique to each user.

     */
    #[JsonProperty("name")]
    public string $name;

    /**
     * @var ?int $age The age of the user.
    This propery is not required.

     */
    #[JsonProperty("age")]
    public ?int $age;

}

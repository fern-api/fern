<?php

namespace Seed\User\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class CreateUserRequest extends JsonSerializableType
{
    /**
     * @var string $name The name of the user to create.
    This name is unique to each user.

     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var ?int $age The age of the user.
    This property is not required.

     */
    #[JsonProperty('age')]
    public ?int $age;

    /**
     * @param array{
     *   name: string,
     *   age?: ?int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->name = $values['name'];
        $this->age = $values['age'] ?? null;
    }
}

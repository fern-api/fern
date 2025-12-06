<?php

namespace Seed\NullableOptional\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class CreateUserRequest extends JsonSerializableType
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
     * @var ?string $phone
     */
    #[JsonProperty('phone')]
    public ?string $phone;

    /**
     * @var ?Address $address
     */
    #[JsonProperty('address')]
    public ?Address $address;

    /**
     * @param array{
     *   username: string,
     *   email?: ?string,
     *   phone?: ?string,
     *   address?: ?Address,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->username = $values['username'];$this->email = $values['email'] ?? null;$this->phone = $values['phone'] ?? null;$this->address = $values['address'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}

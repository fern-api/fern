<?php

namespace Seed\NullableOptional;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use DateTime;
use Seed\Core\Types\Date;

class UserResponse extends JsonSerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty('id')]
    public string $id;

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
     * @var DateTime $createdAt
     */
    #[JsonProperty('createdAt'), Date(Date::TYPE_DATETIME)]
    public DateTime $createdAt;

    /**
     * @var ?DateTime $updatedAt
     */
    #[JsonProperty('updatedAt'), Date(Date::TYPE_DATETIME)]
    public ?DateTime $updatedAt;

    /**
     * @var ?Address $address
     */
    #[JsonProperty('address')]
    public ?Address $address;

    /**
     * @param array{
     *   id: string,
     *   username: string,
     *   createdAt: DateTime,
     *   email?: ?string,
     *   phone?: ?string,
     *   updatedAt?: ?DateTime,
     *   address?: ?Address,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->id = $values['id'];$this->username = $values['username'];$this->email = $values['email'] ?? null;$this->phone = $values['phone'] ?? null;$this->createdAt = $values['createdAt'];$this->updatedAt = $values['updatedAt'] ?? null;$this->address = $values['address'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}

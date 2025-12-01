<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class UpdateUserRequest extends JsonSerializableType
{
    /**
     * @var ?string $email
     */
    #[JsonProperty('email')]
    public ?string $email;

    /**
     * @var ?bool $emailVerified
     */
    #[JsonProperty('email_verified')]
    public ?bool $emailVerified;

    /**
     * @var ?string $username
     */
    #[JsonProperty('username')]
    public ?string $username;

    /**
     * @var ?string $phoneNumber
     */
    #[JsonProperty('phone_number')]
    public ?string $phoneNumber;

    /**
     * @var ?bool $phoneVerified
     */
    #[JsonProperty('phone_verified')]
    public ?bool $phoneVerified;

    /**
     * @var ?array<string, mixed> $userMetadata
     */
    #[JsonProperty('user_metadata'), ArrayType(['string' => 'mixed'])]
    public ?array $userMetadata;

    /**
     * @var ?array<string, mixed> $appMetadata
     */
    #[JsonProperty('app_metadata'), ArrayType(['string' => 'mixed'])]
    public ?array $appMetadata;

    /**
     * @var ?string $password
     */
    #[JsonProperty('password')]
    public ?string $password;

    /**
     * @var ?bool $blocked
     */
    #[JsonProperty('blocked')]
    public ?bool $blocked;

    /**
     * @param array{
     *   email?: ?string,
     *   emailVerified?: ?bool,
     *   username?: ?string,
     *   phoneNumber?: ?string,
     *   phoneVerified?: ?bool,
     *   userMetadata?: ?array<string, mixed>,
     *   appMetadata?: ?array<string, mixed>,
     *   password?: ?string,
     *   blocked?: ?bool,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->email = $values['email'] ?? null;$this->emailVerified = $values['emailVerified'] ?? null;$this->username = $values['username'] ?? null;$this->phoneNumber = $values['phoneNumber'] ?? null;$this->phoneVerified = $values['phoneVerified'] ?? null;$this->userMetadata = $values['userMetadata'] ?? null;$this->appMetadata = $values['appMetadata'] ?? null;$this->password = $values['password'] ?? null;$this->blocked = $values['blocked'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}

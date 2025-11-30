<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use DateTime;
use Seed\Core\Types\Date;
use Seed\Core\Types\ArrayType;

/**
 * User object similar to Auth0 users
 */
class User extends JsonSerializableType
{
    /**
     * @var string $userId
     */
    #[JsonProperty('user_id')]
    public string $userId;

    /**
     * @var string $email
     */
    #[JsonProperty('email')]
    public string $email;

    /**
     * @var bool $emailVerified
     */
    #[JsonProperty('email_verified')]
    public bool $emailVerified;

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
     * @var DateTime $createdAt
     */
    #[JsonProperty('created_at'), Date(Date::TYPE_DATETIME)]
    public DateTime $createdAt;

    /**
     * @var DateTime $updatedAt
     */
    #[JsonProperty('updated_at'), Date(Date::TYPE_DATETIME)]
    public DateTime $updatedAt;

    /**
     * @var ?array<Identity> $identities
     */
    #[JsonProperty('identities'), ArrayType([Identity::class])]
    public ?array $identities;

    /**
     * @var ?array<string, mixed> $appMetadata
     */
    #[JsonProperty('app_metadata'), ArrayType(['string' => 'mixed'])]
    public ?array $appMetadata;

    /**
     * @var ?array<string, mixed> $userMetadata
     */
    #[JsonProperty('user_metadata'), ArrayType(['string' => 'mixed'])]
    public ?array $userMetadata;

    /**
     * @var ?string $picture
     */
    #[JsonProperty('picture')]
    public ?string $picture;

    /**
     * @var ?string $name
     */
    #[JsonProperty('name')]
    public ?string $name;

    /**
     * @var ?string $nickname
     */
    #[JsonProperty('nickname')]
    public ?string $nickname;

    /**
     * @var ?array<string> $multifactor
     */
    #[JsonProperty('multifactor'), ArrayType(['string'])]
    public ?array $multifactor;

    /**
     * @var ?string $lastIp
     */
    #[JsonProperty('last_ip')]
    public ?string $lastIp;

    /**
     * @var ?DateTime $lastLogin
     */
    #[JsonProperty('last_login'), Date(Date::TYPE_DATETIME)]
    public ?DateTime $lastLogin;

    /**
     * @var ?int $loginsCount
     */
    #[JsonProperty('logins_count')]
    public ?int $loginsCount;

    /**
     * @var ?bool $blocked
     */
    #[JsonProperty('blocked')]
    public ?bool $blocked;

    /**
     * @var ?string $givenName
     */
    #[JsonProperty('given_name')]
    public ?string $givenName;

    /**
     * @var ?string $familyName
     */
    #[JsonProperty('family_name')]
    public ?string $familyName;

    /**
     * @param array{
     *   userId: string,
     *   email: string,
     *   emailVerified: bool,
     *   createdAt: DateTime,
     *   updatedAt: DateTime,
     *   username?: ?string,
     *   phoneNumber?: ?string,
     *   phoneVerified?: ?bool,
     *   identities?: ?array<Identity>,
     *   appMetadata?: ?array<string, mixed>,
     *   userMetadata?: ?array<string, mixed>,
     *   picture?: ?string,
     *   name?: ?string,
     *   nickname?: ?string,
     *   multifactor?: ?array<string>,
     *   lastIp?: ?string,
     *   lastLogin?: ?DateTime,
     *   loginsCount?: ?int,
     *   blocked?: ?bool,
     *   givenName?: ?string,
     *   familyName?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->userId = $values['userId'];$this->email = $values['email'];$this->emailVerified = $values['emailVerified'];$this->username = $values['username'] ?? null;$this->phoneNumber = $values['phoneNumber'] ?? null;$this->phoneVerified = $values['phoneVerified'] ?? null;$this->createdAt = $values['createdAt'];$this->updatedAt = $values['updatedAt'];$this->identities = $values['identities'] ?? null;$this->appMetadata = $values['appMetadata'] ?? null;$this->userMetadata = $values['userMetadata'] ?? null;$this->picture = $values['picture'] ?? null;$this->name = $values['name'] ?? null;$this->nickname = $values['nickname'] ?? null;$this->multifactor = $values['multifactor'] ?? null;$this->lastIp = $values['lastIp'] ?? null;$this->lastLogin = $values['lastLogin'] ?? null;$this->loginsCount = $values['loginsCount'] ?? null;$this->blocked = $values['blocked'] ?? null;$this->givenName = $values['givenName'] ?? null;$this->familyName = $values['familyName'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}

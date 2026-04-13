<?php

namespace Seed\Traits;

use DateTime;
use Seed\Address;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Date;

/**
 * @property string $id
 * @property string $username
 * @property ?string $email
 * @property ?string $phone
 * @property DateTime $createdAt
 * @property ?DateTime $updatedAt
 * @property ?Address $address
 */
trait UserResponse
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
}

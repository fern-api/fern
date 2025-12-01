<?php

namespace Seed\Service\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class PatchComplexRequest extends JsonSerializableType
{
    /**
     * @var ?string $name
     */
    #[JsonProperty('name')]
    public ?string $name;

    /**
     * @var ?int $age
     */
    #[JsonProperty('age')]
    public ?int $age;

    /**
     * @var ?bool $active
     */
    #[JsonProperty('active')]
    public ?bool $active;

    /**
     * @var ?array<string, mixed> $metadata
     */
    #[JsonProperty('metadata'), ArrayType(['string' => 'mixed'])]
    public ?array $metadata;

    /**
     * @var ?array<string> $tags
     */
    #[JsonProperty('tags'), ArrayType(['string'])]
    public ?array $tags;

    /**
     * @var ?string $email
     */
    #[JsonProperty('email')]
    public ?string $email;

    /**
     * @var ?string $nickname
     */
    #[JsonProperty('nickname')]
    public ?string $nickname;

    /**
     * @var ?string $bio
     */
    #[JsonProperty('bio')]
    public ?string $bio;

    /**
     * @var ?string $profileImageUrl
     */
    #[JsonProperty('profileImageUrl')]
    public ?string $profileImageUrl;

    /**
     * @var ?array<string, mixed> $settings
     */
    #[JsonProperty('settings'), ArrayType(['string' => 'mixed'])]
    public ?array $settings;

    /**
     * @param array{
     *   name?: ?string,
     *   age?: ?int,
     *   active?: ?bool,
     *   metadata?: ?array<string, mixed>,
     *   tags?: ?array<string>,
     *   email?: ?string,
     *   nickname?: ?string,
     *   bio?: ?string,
     *   profileImageUrl?: ?string,
     *   settings?: ?array<string, mixed>,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->name = $values['name'] ?? null;$this->age = $values['age'] ?? null;$this->active = $values['active'] ?? null;$this->metadata = $values['metadata'] ?? null;$this->tags = $values['tags'] ?? null;$this->email = $values['email'] ?? null;$this->nickname = $values['nickname'] ?? null;$this->bio = $values['bio'] ?? null;$this->profileImageUrl = $values['profileImageUrl'] ?? null;$this->settings = $values['settings'] ?? null;
    }
}

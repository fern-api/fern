<?php

namespace Seed\Nullable\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Nullable\Types\Metadata;

class CreateUserRequest extends JsonSerializableType
{
    /**
     * @var string $username
     */
    #[JsonProperty('username')]
    public string $username;

    /**
     * @var ?array<string> $tags
     */
    #[JsonProperty('tags'), ArrayType(['string'])]
    public ?array $tags;

    /**
     * @var ?Metadata $metadata
     */
    #[JsonProperty('metadata')]
    public ?Metadata $metadata;

    /**
     * @var ?string $avatar
     */
    #[JsonProperty('avatar')]
    public ?string $avatar;

    /**
     * @param array{
     *   username: string,
     *   tags?: ?array<string>,
     *   metadata?: ?Metadata,
     *   avatar?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->username = $values['username'];$this->tags = $values['tags'] ?? null;$this->metadata = $values['metadata'] ?? null;$this->avatar = $values['avatar'] ?? null;
    }
}

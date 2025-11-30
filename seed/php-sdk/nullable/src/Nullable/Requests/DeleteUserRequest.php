<?php

namespace Seed\Nullable\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class DeleteUserRequest extends JsonSerializableType
{
    /**
     * @var ?string $username The user to delete.
     */
    #[JsonProperty('username')]
    public ?string $username;

    /**
     * @param array{
     *   username?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->username = $values['username'] ?? null;
    }
}

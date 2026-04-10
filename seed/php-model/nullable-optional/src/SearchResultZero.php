<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\UserResponse;
use Seed\Core\Json\JsonProperty;
use DateTime;

class SearchResultZero extends JsonSerializableType
{
    use UserResponse;

    /**
     * @var value-of<SearchResultZeroType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   id: string,
     *   username: string,
     *   createdAt: DateTime,
     *   type: value-of<SearchResultZeroType>,
     *   email?: ?string,
     *   phone?: ?string,
     *   updatedAt?: ?DateTime,
     *   address?: ?Address,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'];
        $this->username = $values['username'];
        $this->email = $values['email'] ?? null;
        $this->phone = $values['phone'] ?? null;
        $this->createdAt = $values['createdAt'];
        $this->updatedAt = $values['updatedAt'] ?? null;
        $this->address = $values['address'] ?? null;
        $this->type = $values['type'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}

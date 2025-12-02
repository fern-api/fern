<?php

namespace Seed\Users;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UserOptionalListPage extends JsonSerializableType
{
    /**
     * @var UserOptionalListContainer $data
     */
    #[JsonProperty('data')]
    public UserOptionalListContainer $data;

    /**
     * @var ?string $next
     */
    #[JsonProperty('next')]
    public ?string $next;

    /**
     * @param array{
     *   data: UserOptionalListContainer,
     *   next?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->data = $values['data'];$this->next = $values['next'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}

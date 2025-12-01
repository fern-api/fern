<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UsernameCursor extends JsonSerializableType
{
    /**
     * @var UsernamePage $cursor
     */
    #[JsonProperty('cursor')]
    private UsernamePage $cursor;

    /**
     * @param array{
     *   cursor: UsernamePage,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->cursor = $values['cursor'];
    }

    /**
     * @return UsernamePage
     */
    public function getCursor(): UsernamePage {
        return $this->cursor;}

    /**
     * @param UsernamePage $value
     */
    public function setCursor(UsernamePage $value): self {
        $this->cursor = $value;return $this;}

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}

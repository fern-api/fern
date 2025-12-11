<?php

namespace Seed\Users\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class ListUsersMixedTypePaginationResponse extends JsonSerializableType
{
    /**
     * @var string $next
     */
    #[JsonProperty('next')]
    private string $next;

    /**
     * @var array<User> $data
     */
    #[JsonProperty('data'), ArrayType([User::class])]
    private array $data;

    /**
     * @param array{
     *   next: string,
     *   data: array<User>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->next = $values['next'];$this->data = $values['data'];
    }

    /**
     * @return string
     */
    public function getNext(): string {
        return $this->next;}

    /**
     * @param string $value
     */
    public function setNext(string $value): self {
        $this->next = $value;return $this;}

    /**
     * @return array<User>
     */
    public function getData(): array {
        return $this->data;}

    /**
     * @param array<User> $value
     */
    public function setData(array $value): self {
        $this->data = $value;return $this;}

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}

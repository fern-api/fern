<?php

namespace Seed\Users\Requests;

use Seed\Core\Json\JsonSerializableType;

class ListUsersOptionalDataRequest extends JsonSerializableType
{
    /**
     * @var ?int $page Defaults to first page
     */
    private ?int $page;

    /**
     * @param array{
     *   page?: ?int,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->page = $values['page'] ?? null;
    }

    /**
     * @return ?int
     */
    public function getPage(): ?int
    {
        return $this->page;
    }

    /**
     * @param ?int $value
     */
    public function setPage(?int $value = null): self
    {
        $this->page = $value;
        return $this;
    }
}

<?php

namespace Seed\Users\Requests;

use Seed\Core\Json\JsonSerializableType;

class ListWithGlobalConfigRequest extends JsonSerializableType
{
    /**
     * @var ?int $offset
     */
    private ?int $offset;

    /**
     * @param array{
     *   offset?: ?int,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->offset = $values['offset'] ?? null;
    }

    /**
     * @return ?int
     */
    public function getOffset(): ?int {
        return $this->offset;}

    /**
     * @param ?int $value
     */
    public function setOffset(?int $value = null): self {
        $this->offset = $value;return $this;}
}

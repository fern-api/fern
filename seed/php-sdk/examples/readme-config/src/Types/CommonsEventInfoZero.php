<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\CommonsMetadata;
use Seed\Core\Json\JsonProperty;

class CommonsEventInfoZero extends JsonSerializableType
{
    use CommonsMetadata;

    /**
     * @var value-of<CommonsEventInfoZeroType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   id: string,
     *   type: value-of<CommonsEventInfoZeroType>,
     *   data?: ?array<string, ?string>,
     *   jsonString?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'];
        $this->data = $values['data'] ?? null;
        $this->jsonString = $values['jsonString'] ?? null;
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

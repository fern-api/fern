<?php

namespace Seed\Realtime;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class FlushedEvent extends JsonSerializableType
{
    /**
     * @var 'flushed' $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   type: 'flushed',
     * } $values
     */
    public function __construct(
        array $values,
    ) {
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

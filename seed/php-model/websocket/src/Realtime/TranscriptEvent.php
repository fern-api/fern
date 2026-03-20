<?php

namespace Seed\Realtime;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class TranscriptEvent extends JsonSerializableType
{
    /**
     * @var 'transcript' $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @var string $data
     */
    #[JsonProperty('data')]
    public string $data;

    /**
     * @param array{
     *   type: 'transcript',
     *   data: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
        $this->data = $values['data'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}

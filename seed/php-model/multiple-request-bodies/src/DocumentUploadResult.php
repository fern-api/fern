<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class DocumentUploadResult extends JsonSerializableType
{
    /**
     * @var ?string $fileId
     */
    #[JsonProperty('fileId')]
    public ?string $fileId;

    /**
     * @var ?string $status
     */
    #[JsonProperty('status')]
    public ?string $status;

    /**
     * @param array{
     *   fileId?: ?string,
     *   status?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->fileId = $values['fileId'] ?? null;$this->status = $values['status'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}

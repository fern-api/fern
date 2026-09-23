<?php

namespace Seed\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Utils\File;
use Seed\Core\Json\JsonProperty;

class UploadAuditLogRequest extends JsonSerializableType
{
    /**
     * @var File $file
     */
    public File $file;

    /**
     * @var ?bool $resolved
     */
    #[JsonProperty('resolved')]
    public ?bool $resolved;

    /**
     * @param array{
     *   file: File,
     *   resolved?: ?bool,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->file = $values['file'];
        $this->resolved = $values['resolved'] ?? null;
    }
}

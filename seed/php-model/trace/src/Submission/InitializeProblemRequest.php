<?php

namespace Seed\Submission;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class InitializeProblemRequest extends SerializableType
{
    /**
     * @var string $problemId
     */
    #[JsonProperty('problemId')]
    public string $problemId;

    /**
     * @var ?int $problemVersion
     */
    #[JsonProperty('problemVersion')]
    public ?int $problemVersion;

    /**
     * @param array{
     *   problemId: string,
     *   problemVersion?: ?int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->problemId = $values['problemId'];
        $this->problemVersion = $values['problemVersion'] ?? null;
    }
}

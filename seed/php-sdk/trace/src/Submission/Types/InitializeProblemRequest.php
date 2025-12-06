<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class InitializeProblemRequest extends JsonSerializableType
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
    )
    {
        $this->problemId = $values['problemId'];$this->problemVersion = $values['problemVersion'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}

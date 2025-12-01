<?php

namespace Seed\NullableOptional;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class EmailNotification extends JsonSerializableType
{
    /**
     * @var string $emailAddress
     */
    #[JsonProperty('emailAddress')]
    public string $emailAddress;

    /**
     * @var string $subject
     */
    #[JsonProperty('subject')]
    public string $subject;

    /**
     * @var ?string $htmlContent
     */
    #[JsonProperty('htmlContent')]
    public ?string $htmlContent;

    /**
     * @param array{
     *   emailAddress: string,
     *   subject: string,
     *   htmlContent?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->emailAddress = $values['emailAddress'];$this->subject = $values['subject'];$this->htmlContent = $values['htmlContent'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}

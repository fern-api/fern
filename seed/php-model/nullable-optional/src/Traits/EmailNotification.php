<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property string $emailAddress
 * @property string $subject
 * @property ?string $htmlContent
 */
trait EmailNotification
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
}

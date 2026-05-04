<?php

namespace Seed\Conversations\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class OutboundCallConversationsRequest extends JsonSerializableType
{
    /**
     * @var string $toPhoneNumber The phone number to call in E.164 format.
     */
    #[JsonProperty('to_phone_number')]
    public string $toPhoneNumber;

    /**
     * @var ?bool $dryRun If true, validates the outbound call setup without placing a call.
     */
    #[JsonProperty('dry_run')]
    public ?bool $dryRun;

    /**
     * @param array{
     *   toPhoneNumber: string,
     *   dryRun?: ?bool,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->toPhoneNumber = $values['toPhoneNumber'];
        $this->dryRun = $values['dryRun'] ?? null;
    }
}

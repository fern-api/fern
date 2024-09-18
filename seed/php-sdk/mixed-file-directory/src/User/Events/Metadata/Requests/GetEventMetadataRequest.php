<?php

namespace Seed\User\Events\Metadata\Requests;

class GetEventMetadataRequest
{
    /**
     * @var string $id
     */
    public string $id;

    /**
     * @param string $id
     */
    public function __construct(
        string $id,
    ) {
        $this->id = $id;
    }
}

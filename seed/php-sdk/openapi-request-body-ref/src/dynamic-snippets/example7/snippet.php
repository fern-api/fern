<?php

namespace Example;

use Seed\SeedClient;
use Seed\TeamMember\Requests\UpdateTeamMemberRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->teamMember->updateTeamMember(
    'team_member_id',
    new UpdateTeamMemberRequest([]),
);

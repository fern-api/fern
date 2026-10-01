<?php

namespace Seed\Types;

enum DialRecordItem: string
{
    case RecordFromAnswer = "record-from-answer";
    case RecordFromRinging = "record-from-ringing";
}

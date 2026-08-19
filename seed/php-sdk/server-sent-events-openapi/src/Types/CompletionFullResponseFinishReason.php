<?php

namespace Seed\Types;

enum CompletionFullResponseFinishReason: string
{
    case Complete = "complete";
    case Length = "length";
    case Error = "error";
}

<?php

namespace Seed;

enum CompletionFullResponseFinishReason: string
{
    case Complete = "complete";
    case Length = "length";
    case Error = "error";
}

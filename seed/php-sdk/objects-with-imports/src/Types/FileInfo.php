<?php

namespace Seed\Types;

enum FileInfo: string
{
    case Regular = "REGULAR";
    case Directory = "DIRECTORY";
}

<?php

namespace Seed\File\Types;

enum FileInfo
 : string {
    case Regular = "REGULAR";
    case Directory = "DIRECTORY";
}

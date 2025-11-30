<?php

namespace Seed;

enum EnumWithSpecialCharacters
 : string {
    case Bla = "\\\$bla";
    case Yo = "\\\$yo";
}

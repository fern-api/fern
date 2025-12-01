<?php

namespace Seed\Types;

enum EnumWithCustom
 : string {
    case Safe = "safe";
    case Custom = "Custom";
}

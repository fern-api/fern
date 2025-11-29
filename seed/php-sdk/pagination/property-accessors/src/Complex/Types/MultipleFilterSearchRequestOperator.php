<?php

namespace Seed\Complex\Types;

enum MultipleFilterSearchRequestOperator
 : string {
    case And_ = "AND";
    case Or_ = "OR";
}

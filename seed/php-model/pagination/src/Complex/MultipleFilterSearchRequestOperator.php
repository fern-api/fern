<?php

namespace Seed\Complex;

enum MultipleFilterSearchRequestOperator
 : string {
    case And_ = "AND";
    case Or_ = "OR";
}

# frozen_string_literal: true

module SeedPaginationClient
  class Complex
    class SingleFilterSearchRequestOperator
      EQUALS = "="
      NOT_EQUALS = "!="
      IN = "IN"
      NOT_IN = "NIN"
      LESS_THAN = "<"
      GREATER_THAN = ">"
      CONTAINS = "~"
      DOES_NOT_CONTAIN = "!~"
      STARTS_WITH = "^"
      ENDS_WITH = "$"
    end
  end
end

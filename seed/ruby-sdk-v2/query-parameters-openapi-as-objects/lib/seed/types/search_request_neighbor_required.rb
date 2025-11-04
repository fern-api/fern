# frozen_string_literal: true

module Seed
  module Types
    class SearchRequestNeighborRequired < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::User }
      member -> { Seed::Types::NestedUser }
      member -> { String }
      member -> { Integer }
    end
  end
end

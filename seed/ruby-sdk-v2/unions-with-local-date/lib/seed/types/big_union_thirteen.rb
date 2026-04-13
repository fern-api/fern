# frozen_string_literal: true

module Seed
  module Types
    class BigUnionThirteen < Internal::Types::Model
      field :type, -> { Seed::Types::BigUnionThirteenType }, optional: false, nullable: false
    end
  end
end

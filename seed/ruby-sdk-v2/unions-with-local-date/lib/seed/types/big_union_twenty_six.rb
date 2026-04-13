# frozen_string_literal: true

module Seed
  module Types
    class BigUnionTwentySix < Internal::Types::Model
      field :type, -> { Seed::Types::BigUnionTwentySixType }, optional: false, nullable: false
    end
  end
end

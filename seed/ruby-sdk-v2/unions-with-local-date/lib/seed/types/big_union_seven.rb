# frozen_string_literal: true

module Seed
  module Types
    class BigUnionSeven < Internal::Types::Model
      field :type, -> { Seed::Types::BigUnionSevenType }, optional: false, nullable: false
    end
  end
end

# frozen_string_literal: true

module Seed
  module Types
    class BigUnionTwentySeven < Internal::Types::Model
      field :type, -> { Seed::Types::BigUnionTwentySevenType }, optional: false, nullable: false
    end
  end
end

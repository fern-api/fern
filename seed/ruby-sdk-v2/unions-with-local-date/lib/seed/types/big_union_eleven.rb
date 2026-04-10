# frozen_string_literal: true

module Seed
  module Types
    class BigUnionEleven < Internal::Types::Model
      field :type, -> { Seed::Types::BigUnionElevenType }, optional: false, nullable: false
    end
  end
end

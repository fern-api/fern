# frozen_string_literal: true

module Seed
  module Types
    class DiscriminatedLiteralDefaultName < Internal::Types::Model
      field :value, -> { Seed::Types::DiscriminatedLiteralDefaultNameValue }, optional: true, nullable: false
    end
  end
end

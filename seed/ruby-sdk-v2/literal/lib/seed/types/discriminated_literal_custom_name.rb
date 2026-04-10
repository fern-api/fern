# frozen_string_literal: true

module Seed
  module Types
    class DiscriminatedLiteralCustomName < Internal::Types::Model
      field :value, -> { String }, optional: true, nullable: false
    end
  end
end

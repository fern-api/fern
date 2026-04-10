# frozen_string_literal: true

module Seed
  module Types
    class DiscriminatedLiteralGeorge < Internal::Types::Model
      field :value, -> { Internal::Types::Boolean }, optional: true, nullable: false
    end
  end
end

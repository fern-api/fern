# frozen_string_literal: true

module Seed
  module Types
    class ValidateUnionRequestResponse < Internal::Types::Model
      field :valid, -> { Internal::Types::Boolean }, optional: true, nullable: false
    end
  end
end

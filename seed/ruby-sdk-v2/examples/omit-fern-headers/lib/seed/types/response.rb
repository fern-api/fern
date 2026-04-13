# frozen_string_literal: true

module Seed
  module Types
    class Response < Internal::Types::Model
      field :response, -> { Object }, optional: false, nullable: false
      field :identifiers, -> { Internal::Types::Array[Seed::Types::Identifier] }, optional: false, nullable: false
    end
  end
end

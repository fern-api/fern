# frozen_string_literal: true

module Seed
  module Types
    module Types
      class Response < Internal::Types::Model
        field :response, -> { Internal::Types::Hash[String, Object] }, optional: false, nullable: false
        field :identifiers, -> { Internal::Types::Array[Seed::Types::Identifier] }, optional: false, nullable: false
      end
    end
  end
end

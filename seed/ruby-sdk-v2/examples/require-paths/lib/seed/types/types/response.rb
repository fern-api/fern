# frozen_string_literal: true

module FernExamples
  module Types
    module Types
      class Response < Internal::Types::Model
        field :response, -> { Object }, optional: false, nullable: false
        field :identifiers, -> { Internal::Types::Array[FernExamples::Types::Identifier] }, optional: false, nullable: false
      end
    end
  end
end

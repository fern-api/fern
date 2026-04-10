# frozen_string_literal: true

module Seed
  module Types
    class V2V3VoidFunctionSignature < Internal::Types::Model
      field :parameters, -> { Internal::Types::Array[Seed::Types::V2V3Parameter] }, optional: false, nullable: false
    end
  end
end

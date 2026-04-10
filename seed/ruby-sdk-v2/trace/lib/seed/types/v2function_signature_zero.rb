# frozen_string_literal: true

module Seed
  module Types
    class V2FunctionSignatureZero < Internal::Types::Model
      field :type, -> { Seed::Types::V2FunctionSignatureZeroType }, optional: false, nullable: false
    end
  end
end

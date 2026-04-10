# frozen_string_literal: true

module Seed
  module Types
    class V2FunctionSignature < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::V2FunctionSignatureZero }
      member -> { Seed::Types::V2FunctionSignatureOne }
      member -> { Seed::Types::V2FunctionSignatureTwo }
    end
  end
end

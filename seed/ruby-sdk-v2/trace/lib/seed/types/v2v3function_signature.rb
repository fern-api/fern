# frozen_string_literal: true

module Seed
  module Types
    class V2V3FunctionSignature < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::V2V3FunctionSignatureZero }
      member -> { Seed::Types::V2V3FunctionSignatureOne }
      member -> { Seed::Types::V2V3FunctionSignatureTwo }
    end
  end
end

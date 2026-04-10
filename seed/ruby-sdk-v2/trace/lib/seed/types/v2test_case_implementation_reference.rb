# frozen_string_literal: true

module Seed
  module Types
    class V2TestCaseImplementationReference < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::V2TestCaseImplementationReferenceType }
      member -> { Seed::Types::V2TestCaseImplementationReferenceOne }
    end
  end
end

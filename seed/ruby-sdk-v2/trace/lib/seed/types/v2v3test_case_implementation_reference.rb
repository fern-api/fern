# frozen_string_literal: true

module Seed
  module Types
    class V2V3TestCaseImplementationReference < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::V2V3TestCaseImplementationReferenceType }
      member -> { Seed::Types::V2V3TestCaseImplementationReferenceOne }
    end
  end
end

# frozen_string_literal: true

module Seed
  module Types
    class V2TestCaseImplementationReferenceOne < Internal::Types::Model
      field :type, -> { Seed::Types::V2TestCaseImplementationReferenceOneType }, optional: false, nullable: false
    end
  end
end

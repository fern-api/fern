# frozen_string_literal: true

module Seed
  module Types
    class V2V3TestCaseImplementationReferenceOne < Internal::Types::Model
      field :type, -> { Seed::Types::V2V3TestCaseImplementationReferenceOneType }, optional: false, nullable: false
    end
  end
end

# frozen_string_literal: true

module Seed
  module Types
    class V2TestCaseImplementationReferenceType < Internal::Types::Model
      field :type, -> { Seed::Types::V2TestCaseImplementationReferenceTypeType }, optional: false, nullable: false
      field :value, -> { String }, optional: true, nullable: false
    end
  end
end

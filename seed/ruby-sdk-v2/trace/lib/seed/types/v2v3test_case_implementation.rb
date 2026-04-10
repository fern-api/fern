# frozen_string_literal: true

module Seed
  module Types
    class V2V3TestCaseImplementation < Internal::Types::Model
      field :description, -> { Seed::Types::V2V3TestCaseImplementationDescription }, optional: false, nullable: false
      field :function, -> { Seed::Types::V2V3TestCaseFunction }, optional: false, nullable: false
    end
  end
end

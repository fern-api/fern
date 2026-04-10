# frozen_string_literal: true

module Seed
  module Types
    class V2TestCaseImplementation < Internal::Types::Model
      field :description, -> { Seed::Types::V2TestCaseImplementationDescription }, optional: false, nullable: false
      field :function, -> { Seed::Types::V2TestCaseFunction }, optional: false, nullable: false
    end
  end
end

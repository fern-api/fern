# frozen_string_literal: true

module Seed
  module V2
    module Problem
      module Types
        class TestCaseImplementationReference < Internal::Types::Model
          extend Seed::Internal::Types::Union

          discriminant :type

          member -> { String }, key: "TEMPLATE_ID"
          member -> { Seed::V2::Problem::Types::TestCaseImplementation }, key: "IMPLEMENTATION"
        end
      end
    end
  end
end

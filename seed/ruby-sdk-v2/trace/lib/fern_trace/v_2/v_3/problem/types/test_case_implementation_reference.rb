# frozen_string_literal: true

module FernTrace
  module V2
    module V3
      module Problem
        module Types
          class TestCaseImplementationReference < Internal::Types::Model
            extend FernTrace::Internal::Types::Union

            discriminant :type

            member -> { String }, key: "TEMPLATE_ID"
            member -> { FernTrace::V2::V3::Problem::Types::TestCaseImplementation }, key: "IMPLEMENTATION"
          end
        end
      end
    end
  end
end

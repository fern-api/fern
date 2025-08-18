# frozen_string_literal: true

module Seed
    module Types
        class TestCaseImplementationReference < Internal::Types::Union

            discriminant :type

            member -> { String }, key: "TEMPLATE_ID"
            member -> { Seed::V2::Problem::TestCaseImplementation }, key: "IMPLEMENTATION"
    end
end

# frozen_string_literal: true

module Seed
    module Types
        class TestCaseImplementation < Internal::Types::Model
            field :description, Seed::V2::V3::Problem::TestCaseImplementationDescription, optional: false, nullable: false
            field :function, Seed::V2::V3::Problem::TestCaseFunction, optional: false, nullable: false

    end
end

# frozen_string_literal: true

module Seed
    module Types
        class TestCaseImplementationDescription < Internal::Types::Model
            field :boards, Internal::Types::Array[Seed::V2::Problem::TestCaseImplementationDescriptionBoard], optional: false, nullable: false

    end
end

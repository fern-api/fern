# frozen_string_literal: true

module Seed
    module Types
        class TestCaseV2 < Internal::Types::Model
            field :metadata, Seed::V2::Problem::TestCaseMetadata, optional: false, nullable: false
            field :implementation, Seed::V2::Problem::TestCaseImplementationReference, optional: false, nullable: false
            field :arguments, Internal::Types::Hash[String, Seed::Commons::VariableValue], optional: false, nullable: false
            field :expects, Seed::V2::Problem::TestCaseExpects, optional: true, nullable: false

    end
end

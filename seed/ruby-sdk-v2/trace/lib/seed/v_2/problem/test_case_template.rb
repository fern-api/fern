# frozen_string_literal: true

module Seed
    module Types
        class TestCaseTemplate < Internal::Types::Model
            field :template_id, String, optional: false, nullable: false
            field :name, String, optional: false, nullable: false
            field :implementation, Seed::V2::Problem::TestCaseImplementation, optional: false, nullable: false

    end
end

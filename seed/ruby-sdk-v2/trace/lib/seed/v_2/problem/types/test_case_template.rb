# frozen_string_literal: true

module Seed
  module V2
    module Problem
      module Types
        class TestCaseTemplate < Internal::Types::Model
          field :template_id, -> { String }, optional: false, nullable: false, api_name: "templateId"
          field :name, -> { String }, optional: false, nullable: false
          field :implementation, lambda {
            Seed::V2::Problem::Types::TestCaseImplementation
          }, optional: false, nullable: false
        end
      end
    end
  end
end

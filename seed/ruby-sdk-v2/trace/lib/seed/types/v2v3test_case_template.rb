# frozen_string_literal: true

module Seed
  module Types
    class V2V3TestCaseTemplate < Internal::Types::Model
      field :template_id, -> { String }, optional: false, nullable: false, api_name: "templateId"
      field :name, -> { String }, optional: false, nullable: false
      field :implementation, -> { Seed::Types::V2V3TestCaseImplementation }, optional: false, nullable: false
    end
  end
end

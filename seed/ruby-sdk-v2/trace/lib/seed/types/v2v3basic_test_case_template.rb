# frozen_string_literal: true

module Seed
  module Types
    class V2V3BasicTestCaseTemplate < Internal::Types::Model
      field :template_id, -> { String }, optional: false, nullable: false, api_name: "templateId"
      field :name, -> { String }, optional: false, nullable: false
      field :description, -> { Seed::Types::V2V3TestCaseImplementationDescription }, optional: false, nullable: false
      field :expected_value_parameter_id, -> { String }, optional: false, nullable: false, api_name: "expectedValueParameterId"
    end
  end
end

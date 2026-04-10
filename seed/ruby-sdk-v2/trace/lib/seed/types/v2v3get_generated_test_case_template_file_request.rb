# frozen_string_literal: true

module Seed
  module Types
    class V2V3GetGeneratedTestCaseTemplateFileRequest < Internal::Types::Model
      field :template, -> { Seed::Types::V2V3TestCaseTemplate }, optional: false, nullable: false
    end
  end
end

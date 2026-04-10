# frozen_string_literal: true

module Seed
  module Types
    class V2GetGeneratedTestCaseTemplateFileRequest < Internal::Types::Model
      field :template, -> { Seed::Types::V2TestCaseTemplate }, optional: false, nullable: false
    end
  end
end

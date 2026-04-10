# frozen_string_literal: true

module Seed
  module Types
    class V2V3FunctionImplementationForMultipleLanguages < Internal::Types::Model
      field :code_by_language, -> { Internal::Types::Hash[String, Seed::Types::V2V3FunctionImplementation] }, optional: false, nullable: false, api_name: "codeByLanguage"
    end
  end
end

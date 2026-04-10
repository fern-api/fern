# frozen_string_literal: true

module Seed
  module Types
    class V2FunctionImplementationForMultipleLanguages < Internal::Types::Model
      field :code_by_language, -> { Internal::Types::Hash[String, Seed::Types::V2FunctionImplementation] }, optional: false, nullable: false, api_name: "codeByLanguage"
    end
  end
end

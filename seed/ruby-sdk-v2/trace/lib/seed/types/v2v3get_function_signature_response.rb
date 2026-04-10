# frozen_string_literal: true

module Seed
  module Types
    class V2V3GetFunctionSignatureResponse < Internal::Types::Model
      field :function_by_language, -> { Internal::Types::Hash[String, String] }, optional: false, nullable: false, api_name: "functionByLanguage"
    end
  end
end

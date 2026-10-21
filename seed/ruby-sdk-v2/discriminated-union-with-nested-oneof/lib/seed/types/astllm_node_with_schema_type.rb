# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    module AstllmNodeWithSchemaType
      extend Seed::Internal::Types::Enum

      LLM = "llm"
    end
  end
end

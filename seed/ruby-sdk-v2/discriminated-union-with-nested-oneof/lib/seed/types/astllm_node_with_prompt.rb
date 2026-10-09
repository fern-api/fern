# frozen_string_literal: true

module Seed
  module Types
    class AstllmNodeWithPrompt < Internal::Types::Model
      field :type, -> { Seed::Types::AstllmNodeWithPromptType }, optional: false, nullable: false

      field :model, -> { String }, optional: false, nullable: false

      field :prompt, -> { String }, optional: false, nullable: false
    end
  end
end

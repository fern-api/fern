# frozen_string_literal: true

module Seed
  module Types
    class AstNodeLlm < Internal::Types::Model
      field :model, -> { String }, optional: false, nullable: false

      field :value_schema, -> { Internal::Types::Hash[String, Object] }, optional: true, nullable: false

      field :prompt, -> { String }, optional: true, nullable: false
    end
  end
end

# frozen_string_literal: true

module Seed
  module Types
    class AstllmNodeWithSchema < Internal::Types::Model
      field :type, -> { Seed::Types::AstllmNodeWithSchemaType }, optional: false, nullable: false

      field :model, -> { String }, optional: false, nullable: false

      field :value_schema, -> { Internal::Types::Hash[String, Object] }, optional: false, nullable: false
    end
  end
end

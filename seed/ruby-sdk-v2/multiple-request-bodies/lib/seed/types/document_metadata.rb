# frozen_string_literal: true

module Seed
  module Types
    class DocumentMetadata < Internal::Types::Model
      field :author, -> { String }, optional: true, nullable: false
      field :id, -> { Integer }, optional: true, nullable: false
      field :tags, -> { Internal::Types::Array[Internal::Types::Hash[String, Object]] }, optional: true, nullable: false
      field :title, -> { String }, optional: true, nullable: false
    end
  end
end

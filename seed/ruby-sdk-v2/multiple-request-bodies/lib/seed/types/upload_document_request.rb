# frozen_string_literal: true

module Seed
  module Types
    class UploadDocumentRequest < Internal::Types::Model
      field :author, -> { String }, optional: true, nullable: false
      field :tags, -> { Internal::Types::Array[String] }, optional: true, nullable: false
      field :title, -> { String }, optional: true, nullable: false
    end
  end
end

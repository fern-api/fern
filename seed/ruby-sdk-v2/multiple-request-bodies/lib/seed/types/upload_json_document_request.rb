
module Seed
  module 
    module Types
      class UploadJSONDocumentRequest < Internal::Types::Model
        field :author, -> { String }, optional: true, nullable: false
        field :tags, -> { Internal::Types::Array[String] }, optional: true, nullable: false
        field :title, -> { String }, optional: true, nullable: false

      end
    end
  end
end

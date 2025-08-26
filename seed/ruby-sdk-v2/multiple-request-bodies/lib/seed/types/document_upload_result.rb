# frozen_string_literal: true

module Seed
  module Types
    class DocumentUploadResult < Internal::Types::Model
      field :file_id, -> { String }, optional: true, nullable: false
      field :status, -> { String }, optional: true, nullable: false
    end
  end
end

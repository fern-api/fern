# frozen_string_literal: true

module Seed
  module Files
    module Types
      class FilesUploadRequest < Internal::Types::Model
        field :name, -> { String }, optional: false, nullable: false
        field :parent_id, -> { String }, optional: false, nullable: false
      end
    end
  end
end

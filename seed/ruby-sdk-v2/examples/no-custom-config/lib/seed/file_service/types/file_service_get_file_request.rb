# frozen_string_literal: true

module Seed
  module FileService
    module Types
      class FileServiceGetFileRequest < Internal::Types::Model
        field :filename, -> { String }, optional: false, nullable: false
      end
    end
  end
end

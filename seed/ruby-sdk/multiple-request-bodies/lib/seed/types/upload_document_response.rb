# frozen_string_literal: true

module Seed
  module Types
    class UploadDocumentResponse < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::DocumentMetadata }
      member -> { Seed::Types::DocumentUploadResult }
    end
  end
end

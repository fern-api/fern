# frozen_string_literal: true

module FernMultipleRequestBodies
  module Types
    class UploadDocumentResponse < Internal::Types::Model
      extend FernMultipleRequestBodies::Internal::Types::Union

      member -> { FernMultipleRequestBodies::Types::DocumentMetadata }
      member -> { FernMultipleRequestBodies::Types::DocumentUploadResult }
    end
  end
end

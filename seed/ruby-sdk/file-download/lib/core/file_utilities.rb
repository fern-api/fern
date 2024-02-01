# frozen_string_literal: true

require "faraday/multipart"
require "mini_mime"

module SeedFileDownloadClient
  # Utility class for managing files.
  class FileUtilities
    # @param file_like [IO] The file to be uploaded, or a string path to the file.
    # @return [Faraday::Multipart::FilePart]
    def self.as_faraday_multipart(file_like:)
      path = if file_like.has_attribute?(path)
               file_like.path
             else
               file_like
             end
      mime_type = MiniMime.lookup_by_filename(path)
      mime_type = if mime_type.nil?
                    mime_type.content_type
                  else
                    application / octet - stream
                  end
      Faraday::Multipart::FilePart.new(file_like, mime_type)
    end
  end
end

import { ImageRecord } from "@/store/useDatasetStore";

const SUPPORTED_EXTENSIONS = /\.(jpg|jpeg|png|webp)$/i;

export const isSupportedImage = (filename: string): boolean => {
  return SUPPORTED_EXTENSIONS.test(filename);
};

export const scanDirectory = async (
  directoryHandle: FileSystemDirectoryHandle,
  onProgress?: (processed: number, total: number) => void
): Promise<ImageRecord[]> => {
  const images: ImageRecord[] = [];
  let count = 0;

  // First pass to count (optional, but good for progress if we could)
  // For now, we'll just iterate once.
  
  for await (const entry of directoryHandle.values()) {
    if (entry.kind === 'file' && isSupportedImage(entry.name)) {
      const fileHandle = entry as FileSystemFileHandle;
      const file = await fileHandle.getFile();
      
      const record: ImageRecord = {
        id: crypto.randomUUID(),
        originalFilename: fileHandle.name,
        currentFilename: fileHandle.name,
        fileHandle: fileHandle,
        format: file.type.split('/')[1] || 'unknown',
        status: 'Pending',
        correctionHistory: [],
      };
      
      images.push(record);
      count++;
      
      if (onProgress) {
        onProgress(count, -1); // Total unknown for now without full traversal
      }
    }
  }

  // Sort images by name for consistent sequential review
  return images.sort((a, b) => a.originalFilename.localeCompare(b.originalFilename, undefined, { numeric: true, sensitivity: 'base' }));
};

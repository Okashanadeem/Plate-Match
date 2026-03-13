import { useDatasetStore, AnnotationStatus } from "@/store/useDatasetStore";
import { useCallback } from "react";

export const useAnnotationActions = () => {
  const { images, currentIndex, updateImageStatus, nextImage } = useDatasetStore();
  const currentImage = images[currentIndex];

  const annotate = useCallback((status: AnnotationStatus, newFilename?: string) => {
    if (!currentImage) return;

    // Apply the status update
    updateImageStatus(currentImage.id, status, newFilename);

    // Auto-advance to next image
    nextImage();
  }, [currentImage, updateImageStatus, nextImage]);

  const onApprove = useCallback(() => annotate('Valid'), [annotate]);
  
  const onUnclear = useCallback(() => annotate('Unclear'), [annotate]);
  
  const onReject = useCallback(() => annotate('Rejected'), [annotate]);
  
  const onRename = useCallback((newFilename: string) => {
    if (!newFilename.trim()) return;
    annotate('Corrected', newFilename.trim());
  }, [annotate]);

  return { onApprove, onUnclear, onReject, onRename, currentImage };
};

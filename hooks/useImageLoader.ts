import { useState, useEffect } from "react";
import { useCacheStore } from "@/store/useCacheStore";

export const useImageLoader = (id: string | undefined, fileHandle: FileSystemFileHandle | null) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { addToCache, getFromCache } = useCacheStore();

  useEffect(() => {
    if (!fileHandle || !id) {
      setImageUrl(null);
      return;
    }

    // 1. Check cache first
    const cachedUrl = getFromCache(id);
    if (cachedUrl) {
      setImageUrl(cachedUrl);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadImage = async () => {
      setLoading(true);
      setError(null);
      try {
        const file = await fileHandle.getFile();
        if (isMounted) {
          const objectUrl = URL.createObjectURL(file);
          addToCache(id, objectUrl);
          setImageUrl(objectUrl);
        }
      } catch (err: any) {
        console.error("Error loading image:", err);
        if (isMounted) setError(err.message || "Failed to load image");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [id, fileHandle, addToCache, getFromCache]);

  return { imageUrl, error, loading };
};

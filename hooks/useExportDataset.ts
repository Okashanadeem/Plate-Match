import { useState, useCallback } from "react";
import JSZip from "jszip";
import { useDatasetStore } from "@/store/useDatasetStore";

export const useExportDataset = () => {
    const { datasetName, images, getStats, pattern, getExtractedPlate } = useDatasetStore();
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const exportDataset = useCallback(async () => {
      if (!datasetName || images.length === 0) return;

      const stats = getStats();
      if (stats.reviewed === 0) {
        alert("No reviewed images to export. Please annotate some images first.");
        return;
      }

      if (stats.pending > 0) {
        if (!confirm(`${stats.pending} images are still pending and will be excluded from the export. Continue?`)) {
          return;
        }
      }

      setIsExporting(true);
      setExportProgress(0);
      setError(null);

      try {
        const zip = new JSZip();
        const root = zip.folder("dataset");
        if (!root) throw new Error("Failed to create zip structure");

        const folders = {
          Valid: root.folder("valid"),
          Corrected: root.folder("corrected"),
          Unclear: root.folder("unclear"),
          Rejected: root.folder("rejected"),
        };

        const exportImages = images.filter(img => img.status !== 'Pending');
        const totalToExport = exportImages.length;
        let processed = 0;

        for (const img of exportImages) {
          const folder = folders[img.status as keyof typeof folders];
          if (!folder) continue;

          const file = await img.fileHandle.getFile();
          
          // Filename resolution logic
          let baseFilename = img.currentFilename;
          
          if (pattern.isActive) {
            // If pattern is active, we almost always want just the plate, 
            // unless the user explicitly unchecked 'exportOnlyPlate' (though we defaulted it to true)
            if (pattern.exportOnlyPlate) {
              baseFilename = getExtractedPlate(img.currentFilename);
            }
          }
          
          const filename = `${baseFilename}${img.originalExtension}`;
          
          folder.file(filename, file);
          
          processed++;
          setExportProgress(Math.round((processed / totalToExport) * 100));
        }

      // Add metadata.json
      const metadata = {
        datasetName,
        exportTimestamp: new Date().toISOString(),
        stats: {
          total: stats.total,
          exported: totalToExport,
          breakdown: {
            valid: stats.valid,
            corrected: stats.corrected,
            unclear: stats.unclear,
            rejected: stats.rejected,
          }
        },
        corrections: images
          .filter(img => img.status === 'Corrected')
          .map(img => ({
            original: img.originalFilename,
            corrected: img.currentFilename,
            history: img.correctionHistory,
          }))
      };

      root.file("metadata.json", JSON.stringify(metadata, null, 2));

      // Generate blob
      const content = await zip.generateAsync({ type: "blob" }, (metadata) => {
        // Optional: Can use this for deeper progress tracking of compression
      });

      // Download
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${datasetName.replace(/\s+/g, '_')}_export.zip`;
      a.click();
      URL.revokeObjectURL(url);

      alert("Export complete!");

    } catch (err: any) {
      console.error("Export failed:", err);
      setError(err.message);
      alert(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  }, [datasetName, images, getStats]);

  return { exportDataset, isExporting, exportProgress, error };
};

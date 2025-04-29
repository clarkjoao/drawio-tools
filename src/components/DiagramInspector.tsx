import React, { useState, useEffect } from "react";
import NodeTree from "./NodeTree";
import NodeProperties from "./NodeProperties";

const DiagramInspector: React.FC = () => {
  const [inspectorSize, setInspectorSize] = useState({ width: 600, height: 400 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const adjustSizeToScreen = () => {
      const maxWidth = Math.min(window.innerWidth - 40, 800);
      const maxHeight = Math.min(window.innerHeight - 40, 600);
      setInspectorSize({ width: maxWidth, height: maxHeight });
    };
    adjustSizeToScreen();
    window.addEventListener("resize", adjustSizeToScreen);
    return () => window.removeEventListener("resize", adjustSizeToScreen);
  }, []);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setResizeStart({ x: e.clientX, y: e.clientY });
    setInitialSize({ ...inspectorSize });
  };

  useEffect(() => {
    if (!isResizing) return;
    const handleResize = (e: MouseEvent) => {
      const newWidth = Math.max(
        400,
        Math.min(800, initialSize.width + (e.clientX - resizeStart.x))
      );
      const newHeight = Math.max(
        400,
        Math.min(800, initialSize.height + (e.clientY - resizeStart.y))
      );
      setInspectorSize({ width: newWidth, height: newHeight });
    };
    const handleResizeEnd = () => setIsResizing(false);
    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", handleResizeEnd);
    return () => {
      document.removeEventListener("mousemove", handleResize);
      document.removeEventListener("mouseup", handleResizeEnd);
    };
  }, [isResizing, resizeStart, initialSize]);

  return (
    <div
      className="bg-white rounded-b-lg shadow-xl overflow-hidden flex flex-col relative"
      style={{ width: inspectorSize.width, height: inspectorSize.height }}
    >
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 border-r border-gray-200 overflow-auto p-2">
          <h3 className="text-sm font-semibold mb-2 text-gray-700">Diagram Elements</h3>
          <NodeTree />
        </div>
        <div className="w-1/2 overflow-auto p-2">
          <h3 className="text-sm font-semibold mb-2 text-gray-700">Properties</h3>
          <NodeProperties />
        </div>
      </div>

      <div
        className="w-5 h-5 absolute bottom-0 right-0 cursor-nwse-resize"
        onMouseDown={handleResizeStart}
      >
        <div className="w-3 h-3 border-r-2 border-b-2 border-blue-600 absolute bottom-1 right-1"></div>
      </div>

      <div className="md:hidden text-xs p-1 text-center bg-gray-100">Drag edges to resize</div>
    </div>
  );
};

export default DiagramInspector;

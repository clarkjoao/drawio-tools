import React, { useState, useEffect } from "react";
import NodeTree from "./NodeTree";
import NodeProperties from "./NodeProperties";
import NodeActions from "./NodeActions";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DiagramInspector: React.FC = () => {
  const [inspectorSize, setInspectorSize] = useState({ width: 900, height: 500 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });

  const [collapsed, setCollapsed] = useState({
    tree: false,
    props: false,
    actions: false
  });

  const toggle = (key: keyof typeof collapsed) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const adjustSizeToScreen = () => {
      const maxWidth = Math.min(window.innerWidth - 40, 1200);
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
        600,
        Math.min(1200, initialSize.width + (e.clientX - resizeStart.x))
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

  const visibleKeys = Object.entries(collapsed)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  const totalVisible = visibleKeys.length || 1;

  const renderPanel = (key: keyof typeof collapsed, title: string, content: React.ReactNode) => {
    const isCollapsed = collapsed[key];
    const basis = isCollapsed ? "w-[14px]" : `flex-1`;

    return (
      <div
        className={`relative flex flex-col transition-all duration-300 ease-in-out overflow-hidden border-r border-gray-200 bg-white h-full ${basis}`}
      >
        <button
          className="absolute top-1 left-1 z-10 bg-white border border-gray-300 rounded hover:bg-gray-100 w-5 h-5 flex items-center justify-center"
          onClick={() => toggle(key)}
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
        {!isCollapsed && (
          <div className="pt-6 px-2 overflow-auto h-full">
            <h3 className="text-sm font-semibold mb-2 text-gray-700">{title}</h3>
            {content}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="bg-white rounded-b-lg shadow-xl overflow-hidden flex flex-col relative"
      style={{ width: inspectorSize.width, height: inspectorSize.height }}
    >
      <div className="flex flex-1 overflow-hidden">
        {renderPanel("tree", "Diagram Elements", <NodeTree />)}
        {renderPanel("props", "Properties", <NodeProperties />)}
        {renderPanel("actions", "Node Action", <NodeActions />)}
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

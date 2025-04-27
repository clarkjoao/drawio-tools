// @ts-nocheck
import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App";
import { MxEvents } from "@/MxGraph/MxEvents";

(window as any).Draw.loadPlugin(function (ui: any) {
  const graph = ui.editor.graph;
  const model = graph.model;
  const codec = new mxCodec();

  function sendXmlToReact() {
    const xmlNode = codec.encode(model);
    const xmlString = mxUtils.getXml(xmlNode);

    console.log("Sending updated XML to React");
    window.postMessage({ type: MxEvents.DRAWIO_XML_UPDATE, payload: xmlString }, "*");
  }

  function sendSelectionToReact() {
    const selectedCells = graph.getSelectionCells() || [];
    const selectedIds = selectedCells.map((cell: any) => cell.id);

    console.log("Selection changed, sending selected IDs to React:", selectedIds);
    window.postMessage({ type: MxEvents.DRAWIO_SELECTION_CHANGED, payload: selectedIds }, "*");
  }

  function handleIncomingMessage(event: MessageEvent) {
    const { type, payload } = event.data || {};

    if (!type) return;

    switch (type) {
      case MxEvents.REACT_XML_UPDATE:
        if (typeof payload === "string") {
          updateModelFromXml(payload);
        }
        break;

      case MxEvents.REACT_SELECT_CELLS:
        if (Array.isArray(payload)) {
          selectCellsByIds(payload);
        }
        break;

      default:
        break;
    }
  }

  function updateModelFromXml(xmlString: string) {
    try {
      const newDoc = mxUtils.parseXml(xmlString);
      const newCodec = new mxCodec(newDoc);
      const newModel = newCodec.decode(newDoc.documentElement);

      model.beginUpdate();
      try {
        model.clear();
        model.mergeChildren(newModel.root, model.root);
      } finally {
        model.endUpdate();
      }

      console.log("Model updated from React");
    } catch (err) {
      console.error("Error updating model from React:", err);
    }
  }

  function selectCellsByIds(ids: string[]) {
    const cells = ids
      .map((id) => model.getCell(id))
      .filter((cell) => cell !== null && cell !== undefined);

    if (cells.length > 0) {
      graph.setSelectionCells(cells);
      console.log("Cells selected via React:", ids);
    } else {
      console.warn("No cells found to select:", ids);
    }
  }

  function createFloatingMenuContainer() {
    const rootFloat = document.getElementById("react-floating-menu");
    if (rootFloat) {
      console.log("FloatingMenu already exists.");
      rootFloat.remove();
    }

    let top = parseInt(localStorage.getItem("react-floating-menu-top") || "100", 10);
    let left = parseInt(localStorage.getItem("react-floating-menu-left") || "100", 10);

    if (isNaN(top) || top < 0) top = 100;
    if (isNaN(left) || left < 0) left = 100;

    const floatingMenu = document.createElement("div");
    floatingMenu.id = "react-floating-menu";
    Object.assign(floatingMenu.style, {
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      width: "500px",
      background: "#ffffff",
      zIndex: "9999",
      border: "1px solid #d6d6d6",
      boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
      borderRadius: "6px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      fontFamily: "Arial, sans-serif",
      fontSize: "14px",
      color: "#333",
      userSelect: "none"
    });

    const dragHeader = document.createElement("div");
    Object.assign(dragHeader.style, {
      height: "40px",
      background: "#f0f0f0",
      borderBottom: "1px solid #d6d6d6",
      cursor: "move",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 12px",
      fontWeight: "bold",
      fontSize: "14px",
      color: "#333"
    });

    const title = document.createElement("span");
    title.textContent = "Helper Tool";

    const toggleButton = document.createElement("img");
    toggleButton.src =
      "data:image/svg+xml;base64,PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj48c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIxNHB4IiBoZWlnaHQ9IjEwcHgiIHZlcnNpb249IjEuMSIgc3R5bGU9ImNvbG9yLXNjaGVtZTogbGlnaHQgZGFyazsiPjxwYXRoIGQ9Ik0gMyA3IEwgNyAzIEwgMTEgNyIgc3Ryb2tlPSIjNzA3MDcwIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz48L3N2Zz4=";
    toggleButton.style.cursor = "pointer";
    toggleButton.style.marginLeft = "8px";

    dragHeader.appendChild(title);
    dragHeader.appendChild(toggleButton);
    floatingMenu.appendChild(dragHeader);

    const rootContainer = document.createElement("div");
    rootContainer.id = "react-root-container";
    Object.assign(rootContainer.style, {
      flex: "1",
      overflowY: "auto",
      background: "#ffffff",
      padding: "4px",
      display: "flex",
      flexDirection: "column"
    });
    floatingMenu.appendChild(rootContainer);

    document.body.appendChild(floatingMenu);

    setupDrag(floatingMenu, dragHeader);

    let isCollapsed = false;

    toggleButton.addEventListener("click", () => {
      isCollapsed = !isCollapsed;
      rootContainer.style.display = isCollapsed ? "none" : "flex";
      toggleButton.src = isCollapsed
        ? "data:image/svg+xml;base64,PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj48c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIxNHB4IiBoZWlnaHQ9IjEwcHgiIHZlcnNpb249IjEuMSIgc3R5bGU9ImNvbG9yLXNjaGVtZTogbGlnaHQgZGFyazsiPjxwYXRoIGQ9Ik0gMyAzIEwgNyA3IEwgMTEgMyIgc3Ryb2tlPSIjNzA3MDcwIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz48L3N2Zz4="
        : "data:image/svg+xml;base64,PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj48c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIxNHB4IiBoZWlnaHQ9IjEwcHgiIHZlcnNpb249IjEuMSIgc3R5bGU9ImNvbG9yLXNjaGVtZTogbGlnaHQgZGFyazsiPjxwYXRoIGQ9Ik0gMyA3IEwgNyAzIEwgMTEgNyIgc3Ryb2tlPSIjNzA3MDcwIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz48L3N2Zz4=";
    });
  }

  function setupDrag(menu: HTMLElement, header: HTMLElement) {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    header.addEventListener("mousedown", (e) => {
      isDragging = true;
      offsetX = e.clientX - menu.offsetLeft;
      offsetY = e.clientY - menu.offsetTop;
      header.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        menu.style.left = `${e.clientX - offsetX}px`;
        menu.style.top = `${e.clientY - offsetY}px`;
      }
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        header.style.cursor = "move";
        localStorage.setItem("react-floating-menu-top", menu.style.top);
        localStorage.setItem("react-floating-menu-left", menu.style.left);
      }
    });
  }

  function init() {
    createFloatingMenuContainer();

    const tryMountReact = () => {
      const container = document.getElementById("react-root-container");
      if (container) {
        const root = ReactDOM.createRoot(container);
        root.render(<App />);
        console.log("React App mounted inside floating menu");
      } else {
        console.warn("Waiting for react-root-container...");
        setTimeout(tryMountReact, 100);
      }
    };
    tryMountReact();

    model.addListener(mxEvent.CHANGE, sendXmlToReact);
    graph.getSelectionModel().addListener(mxEvent.CHANGE, sendSelectionToReact);
    window.addEventListener("message", handleIncomingMessage);
  }

  init();
});
